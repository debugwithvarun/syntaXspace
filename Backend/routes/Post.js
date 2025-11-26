import express from "express";
import dotenv from "dotenv";
import Post from "../models/Post.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { getTimeLabel } from "../Function/Timelabel.js";

dotenv.config();

const PostRouter = express.Router();

const url = "https://judge0-ce.p.rapidapi.com";
const judgeapikey = process.env.JUDGEAPIKEY;
const judgeapihost = process.env.JUDGEAPIHOST;

const toBase64 = (s = "") => Buffer.from(s, "utf8").toString("base64");
const fromBase64 = (b = "") => Buffer.from(b, "base64").toString("utf8");

// ======================= RUN CODE ==========================
PostRouter.route("/run-code").post(async (req, res) => {
  try {
    const { language_id, source_code, stdin } = req.body;

    const response = await fetch(
      `${url}/submissions?base64_encoded=true&wait=true&fields=*`,
      {
        method: "POST",
        headers: {
          "x-rapidapi-key": judgeapikey,
          "x-rapidapi-host": judgeapihost,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language_id,
          source_code: toBase64(source_code),
          stdin: toBase64(stdin),
        }),
      }
    );

    const data = await response.json();

    const rawStdout =
      data.stdout && typeof data.stdout === "string"
        ? fromBase64(data.stdout)
        : "";
    const rawStderr =
      data.stderr && typeof data.stderr === "string"
        ? fromBase64(data.stderr)
        : "";
    const rawCompileOutput =
      data.compile_output && typeof data.compile_output === "string"
        ? fromBase64(data.compile_output)
        : "";
    const rawMessage =
      data.message && typeof data.message === "string"
        ? fromBase64(data.message)
        : "";

    const status = data.status || null;
    const statusId = status?.id ?? null;
    const statusDescription = status?.description || "";

    let finalStdout = rawStdout;
    let finalStderr = rawStderr;

    const isSuccess = statusId === 3;

    if (!isSuccess) {
      if (finalStderr.trim() === "" && rawCompileOutput.trim() !== "") {
        finalStderr = `${statusDescription}\n${rawCompileOutput}`.trim();
      } else if (
        finalStderr.trim() === "" &&
        rawCompileOutput.trim() === "" &&
        rawMessage.trim() !== ""
      ) {
        finalStderr = `${statusDescription}\n${rawMessage}`.trim();
      } else {
        finalStderr = `${statusDescription}\n${finalStderr}`.trim();
      }
    }
    if (isSuccess) {
      finalStderr = ""; // very important
    }

    const normalized = {
      time: data.time || "",
      status: data.status || null,
      status_id: statusId,
      status_description: statusDescription,
      stdout: finalStdout,
      stderr: finalStderr,
    };

    return res.status(200).json(normalized);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Something Went Wrong!" });
  }
});

// ======================= SAVE POST ==========================

PostRouter.route("/save-post").post(async (req, res) => {
  try {
    const {
      code,
      language,
      languageId,
      stdin,
      stdout,
      stderr,
      time,
      title,
      description,
    } = req.body;
    const { username } = req.data;

    const isError = stderr.trim() === "" ? false : true;

    const NewPost = new Post({
      code,
      language,
      languageId,
      stdin,
      stdout,
      stderr,
      time,
      isError,
      title,
      description,
    });

    const savedPost = await NewPost.save();

    await User.updateOne(
      { username: username },
      { $push: { post: savedPost._id.toString() } }
    );

    return res.status(200).json({ msg: "Code Post Successfull" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

// ======================= GET POSTS (WITH COMMENTS) ==========================
PostRouter.route("/get-post").get(async (req, res) => {
  try {
    const viewerUsername =
      req?.data?.username || req?.user?.username || req.query.username;

    if (!viewerUsername) {
      return res.status(400).json({
        success: false,
        message: "Username is required.",
      });
    }

    const user = await User.findOne({ username: viewerUsername }).select("post");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.post || user.post.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No posts found for this user.",
        data: [],
      });
    }

    const posts = await Post.find({
      _id: { $in: user.post },
    })
      .select("title description comment likes createdAt")
      .sort({ createdAt: -1 })
      .lean();

    // collect usernames for avatars (comments + replies)
    const usernames = new Set();
    posts.forEach((post) => {
      post?.comment?.forEach((c) => {
        if (c?.username) usernames.add(c.username);
        c?.replies?.forEach((r) => {
          if (r?.username) usernames.add(r.username);
        });
      });
    });

    const avatarData = await User.find(
      { username: { $in: Array.from(usernames) } },
      { username: 1, profilepic: 1 }
    );

    const avatarMap = {};
    avatarData.forEach((u) => {
      avatarMap[u.username] = u.profilepic || "";
    });

    const formattedPosts = posts.map((post) => {
      const formattedComments = Array.isArray(post.comment)
        ? post.comment.map((comment) => {
            const cLikesArr = Array.isArray(comment.likes)
              ? comment.likes
              : [];
            const cLikesCount = cLikesArr.length;
            const cIsLiked = viewerUsername
              ? cLikesArr.includes(viewerUsername)
              : false;

            const formattedReplies = Array.isArray(comment.replies)
              ? comment.replies.map((reply) => {
                  const rLikesArr = Array.isArray(reply.likes)
                    ? reply.likes
                    : [];
                  const rLikesCount = rLikesArr.length;
                  const rIsLiked = viewerUsername
                    ? rLikesArr.includes(viewerUsername)
                    : false;

                  return {
                    _id: reply._id,
                    username: reply.username,
                    avatar: avatarMap[reply.username] || "",
                    text: reply.text,
                    createdAt: reply.createdAt,
                    likes: rLikesCount,
                    isLiked: rIsLiked,
                  };
                })
              : [];

            return {
              _id: comment._id,
              username: comment.username,
              name: comment.name || "", // if you don't store name, it's fine
              avatar: avatarMap[comment.username] || "",
              text: comment.text,
              createdAt: comment.createdAt,
              likes: cLikesCount,
              isLiked: cIsLiked,
              replies: formattedReplies,
            };
          })
        : [];

      return {
        _id: post._id,
        title: post.title,
        description: post.description,
        likes: post.likes, // still array of usernames at post level
        comment: formattedComments,
        commentCount: Array.isArray(post.comment) ? post.comment.length : 0,
        likes_count: Array.isArray(post.likes) ? post.likes.length : 0,
        timeLabel: getTimeLabel(post.createdAt),
      };
    });

    return res.status(200).json({
      success: true,
      message: "Posts fetched successfully.",
      data: formattedPosts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

// ======================= IDLE GET (OPEN IN EDITOR) ==========================
PostRouter.route("/idle-get").get(async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Post id is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post id.",
      });
    }

    const post = await Post.findById(id).select(
      "code languageId stdin stdout stderr isError language"
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Post fetched successfully.",
      data: {
        code: post.code,
        languageId: post.languageId,
        language: post.language,
        stdin: post.stdin || "",
        stdOut: post.stdout || "",
        stderr: post.stderr || "",
        isError: post.isError,
      },
    });
  } catch (error) {
    console.error("Error fetching idle post:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

// ======================= POST LIKE (TOP LEVEL POST) ==========================
PostRouter.route("/post-like/:postId").post(async (req, res) => {
  try {
    const { postId } = req.params;
    const { username: targetUser } = req.data;

    let liked = false;
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, msg: "Post Not Found" });
    }

    const likesArray = post.likes || [];
    const userIndex = likesArray.indexOf(targetUser);

    if (userIndex === -1) {
      liked = true;
      likesArray.push(targetUser);
    } else {
      liked = false;
      likesArray.splice(userIndex, 1);
    }

    post.likes = likesArray;
    await post.save();

    return res.status(200).json({
      success: true,
      msg: "Post like status updated",
      liked,
      likes: likesArray,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, msg: "Internal Server Error" });
  }
});


// ======================= DELETE POST ==========================
PostRouter.route("/delete-post/:postId").delete(async (req, res) => {
  try {
    const { postId } = req.params;
    const { username } = req.data || {};

    if (!username) {
      return res.status(401).json({
        success: false,
        msg: "Unauthorized: username not found in auth data",
      });
    }

    if (!postId) {
      return res.status(400).json({
        success: false,
        msg: "Post id is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid post id",
      });
    }

    // Find the user
    const user = await User.findOne({ username }).select("post");
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    // Check ownership: postId must exist in user's post array
    const ownsPost = user.post.some(
      (id) => id.toString() === postId.toString()
    );

    if (!ownsPost) {
      return res.status(403).json({
        success: false,
        msg: "You are not allowed to delete this post",
      });
    }

    // Delete the post document
    const deletedPost = await Post.findByIdAndDelete(postId);
    if (!deletedPost) {
      return res.status(404).json({
        success: false,
        msg: "Post not found",
      });
    }

    // Remove post reference from user document
    await User.updateOne(
      { username },
      { $pull: { post: postId } }
    );

    return res.status(200).json({
      success: true,
      msg: "Post deleted successfully",
      postId,
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return res.status(500).json({
      success: false,
      msg: "Internal Server Error",
    });
  }
});


// ======================= ADD COMMENT ==========================
PostRouter.route("/add-comment").post(async (req, res) => {
  try {
    const { username, text, postId, userID } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, msg: "Post Not Found" });
    }

    post.comment.push({
      username,
      text,
      userID,
      likes: [],
      replies: [],
      createdAt: new Date(),
    });

    const data = await post.save();

    return res.status(200).json({
      success: true,
      msg: "Comment added successfully",
      comment: data.comment,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, msg: "Internal Server Error" });
  }
});

// ======================= ADD REPLY ==========================
PostRouter.route("/add-reply").post(async (req, res) => {
  try {
    const { username, text, postId, commentId, userID } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, msg: "Post Not Found" });
    }

    const comment = post.comment.id(commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, msg: "Comment Not Found" });
    }

    comment.replies.push({
      username,
      text,
      userID,
      likes: [],
    });

    await post.save();

    return res.status(200).json({
      success: true,
      msg: "Reply added successfully",
      reply: comment.replies,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, msg: "Internal Server Error" });
  }
});

// ======================= COMMENT LIKE ==========================
PostRouter.route("/comment-like").post(async (req, res) => {
  try {
    const { postId, commentId } = req.body;
    const { username } = req.data || {};

    if (!postId || !commentId || !username) {
      return res.status(400).json({
        success: false,
        msg: "postId, commentId and auth username are required",
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, msg: "Post Not Found" });
    }

    const comment = post.comment.id(commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, msg: "Comment Not Found" });
    }

    if (!Array.isArray(comment.likes)) {
      comment.likes = [];
    }

    let liked = false;
    const idx = comment.likes.indexOf(username);

    if (idx === -1) {
      comment.likes.push(username);
      liked = true;
    } else {
      comment.likes.splice(idx, 1);
      liked = false;
    }

    await post.save();

    return res.status(200).json({
      success: true,
      msg: "Comment like status updated",
      liked,
      likes: comment.likes.length,
      commentId,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, msg: "Internal Server Error" });
  }
});

// ======================= REPLY LIKE ==========================
PostRouter.route("/reply-like").post(async (req, res) => {
  try {
    const { postId, commentId, replyId } = req.body;
    const { username } = req.data || {};

    if (!postId || !commentId || !replyId || !username) {
      return res.status(400).json({
        success: false,
        msg: "postId, commentId, replyId and auth username are required",
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, msg: "Post Not Found" });
    }

    const comment = post.comment.id(commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, msg: "Comment Not Found" });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res
        .status(404)
        .json({ success: false, msg: "Reply Not Found" });
    }

    if (!Array.isArray(reply.likes)) {
      reply.likes = [];
    }

    let liked = false;
    const idx = reply.likes.indexOf(username);

    if (idx === -1) {
      reply.likes.push(username);
      liked = true;
    } else {
      reply.likes.splice(idx, 1);
      liked = false;
    }

    await post.save();

    return res.status(200).json({
      success: true,
      msg: "Reply like status updated",
      liked,
      likes: reply.likes.length,
      replyId,
      commentId,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, msg: "Internal Server Error" });
  }
});

// ======================= DELETE COMMENT ==========================
PostRouter.route("/delete-comment").delete(async (req, res) => {
  try {
    const { postId, commentId } = req.body;
    const { username } = req.data || {};

    if (!postId || !commentId || !username) {
      return res.status(400).json({
        success: false,
        msg: "postId, commentId and auth username are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid post id",
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, msg: "Post Not Found" });
    }

    const comment = post.comment.id(commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, msg: "Comment Not Found" });
    }

    // Only comment owner can delete (adjust rule if you want post owner / admin too)
    if (comment.username !== username) {
      return res.status(403).json({
        success: false,
        msg: "You are not allowed to delete this comment",
      });
    }

    comment.deleteOne(); // remove subdocument
    await post.save();

    return res.status(200).json({
      success: true,
      msg: "Comment deleted successfully",
      commentId,
      postId,
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({
      success: false,
      msg: "Internal Server Error",
    });
  }
});

// ======================= DELETE REPLY ==========================
PostRouter.route("/delete-reply").delete(async (req, res) => {
  try {
    const { postId, commentId, replyId } = req.body;
    const { username } = req.data || {};

    if (!postId || !commentId || !replyId || !username) {
      return res.status(400).json({
        success: false,
        msg: "postId, commentId, replyId and auth username are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid post id",
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, msg: "Post Not Found" });
    }

    const comment = post.comment.id(commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, msg: "Comment Not Found" });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res
        .status(404)
        .json({ success: false, msg: "Reply Not Found" });
    }

    // Only reply owner can delete
    if (reply.username !== username) {
      return res.status(403).json({
        success: false,
        msg: "You are not allowed to delete this reply",
      });
    }

    reply.deleteOne(); // remove subdocument
    await post.save();

    return res.status(200).json({
      success: true,
      msg: "Reply deleted successfully",
      replyId,
      commentId,
      postId,
    });
  } catch (error) {
    console.error("Error deleting reply:", error);
    return res.status(500).json({
      success: false,
      msg: "Internal Server Error",
    });
  }
});

// ======================= GET COMMENTS FOR A POST (REAL-TIME) ==========================
PostRouter.route("/get-comments/:postId").get(async (req, res) => {
  try {
    const { postId } = req.params;

    const viewerUsername =
      req?.data?.username || req?.user?.username || req.query.username;

    if (!viewerUsername) {
      return res.status(400).json({
        success: false,
        message: "Username is required.",
      });
    }

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: "Post id is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post id.",
      });
    }

    const post = await Post.findById(postId).select("comment");
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    const commentsArray = Array.isArray(post.comment) ? [...post.comment] : [];

    // Sort newest first
    commentsArray.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );

    // collect usernames for avatars (comments + replies)
    const usernames = new Set();
    commentsArray.forEach((c) => {
      if (c?.username) usernames.add(c.username);
      c?.replies?.forEach((r) => {
        if (r?.username) usernames.add(r.username);
      });
    });

    const avatarData = await User.find(
      { username: { $in: Array.from(usernames) } },
      { username: 1, profilepic: 1 }
    );

    const avatarMap = {};
    avatarData.forEach((u) => {
      avatarMap[u.username] = u.profilepic || "";
    });

    const formattedComments = commentsArray.map((comment) => {
      const cLikesArr = Array.isArray(comment.likes) ? comment.likes : [];
      const cLikesCount = cLikesArr.length;
      const cIsLiked = viewerUsername
        ? cLikesArr.includes(viewerUsername)
        : false;

      const formattedReplies = Array.isArray(comment.replies)
        ? comment.replies.map((reply) => {
            const rLikesArr = Array.isArray(reply.likes) ? reply.likes : [];
            const rLikesCount = rLikesArr.length;
            const rIsLiked = viewerUsername
              ? rLikesArr.includes(viewerUsername)
              : false;

            return {
              _id: reply._id,
              username: reply.username,
              avatar: avatarMap[reply.username] || "",
              text: reply.text,
              createdAt: reply.createdAt,
              timeLabel: getTimeLabel(reply.createdAt),
              likes: rLikesCount,
              isLiked: rIsLiked,
            };
          })
        : [];

      return {
        _id: comment._id,
        username: comment.username,
        name: comment.name || "",
        avatar: avatarMap[comment.username] || "",
        text: comment.text,
        createdAt: comment.createdAt,
        timeLabel: getTimeLabel(comment.createdAt),
        likes: cLikesCount,
        isLiked: cIsLiked,
        replies: formattedReplies,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Comments fetched successfully.",
      data: formattedComments,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});
export default PostRouter;
