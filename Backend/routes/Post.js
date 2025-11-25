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
    // console.log("Judge0 raw:", data);

    // Decode all relevant fields
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

    // Judge0: status.id === 3 => "Accepted"
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
      finalStderr = "";   // very important
    }
    
    const normalized = {
      time: data.time || "",
      status: data.status || null,            // { id, description }
      status_id: statusId,                    // number
      status_description: statusDescription,  // string
      stdout: finalStdout,
      stderr: finalStderr,                    // error text only (no "Accepted" here)
    };
    

    return res.status(200).json(normalized);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Something Went Wrong!" });
  }
});



PostRouter.route("/save-post").post(async (req, res) => {
  try {
    const { code, language, languageId, stdin, stdout, stderr, time,title,description } = req.body;
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
      description
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






PostRouter.route("/get-post").get(async (req, res) => {
  try {
  
    const username =
      req?.data?.username ||      // e.g. custom middleware
      req?.user?.username ||      // e.g. auth middleware (passport/jwt)
      req.query.username          // fallback: query param ?username=

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required.",
      })
    }

    const user = await User.findOne({ username }).select("post")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      })
    }

    // If user has no posts, just return empty array
    if (!user.post || user.post.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No posts found for this user.",
        data: [],
      })
    }

    // 🔥 Fetch and sort posts (latest first)
    const posts = await Post.find({
      _id: { $in: user.post },
    })
      .select("title description comment likes createdAt")
      .sort({ createdAt: -1 })
      .lean() // get plain objects

    const formattedPosts = posts.map((post) => ({
      _id: post._id,
      title: post.title,
      description: post.description,
      likes: post.likes,
      comment: post.comment,
      commentCount: Array.isArray(post.comment) ? post.comment.length : 0,
      likes_count: Array.isArray(post.likes) ? post.likes.length : 0,
      timeLabel: getTimeLabel(post.createdAt),
    }))

    return res.status(200).json({
      success: true,
      message: "Posts fetched successfully.",
      data: formattedPosts,
    })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    })
  }
})

PostRouter.route("/idle-get").get(async (req, res) => {
  try {
    const { id } = req.query // frontend should call: /idle-get?id=POST_ID

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Post id is required.",
      })
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post id.",
      })
    }

    const post = await Post.findById(id).select(
      "code languageId stdin stdout stderr isError language"
    )

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      })
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
    })
  } catch (error) {
    console.error("Error fetching idle post:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    })
  }
})


PostRouter.route("/post-like/:postId").post(async(req,res)=>{
  try {
  
    const {postId} = req.params;
    console.log("postId:",postId);
    const {username:targetUser} = req.data;
    let liked=false;
    const post = await Post.findById(postId);
    if(!post){
      return res.status(404).json({success:false,msg:"Post Not Found"})
    }
    const likesArray = post.likes || [];

    const userIndex = likesArray.indexOf(targetUser);
    if(userIndex===-1){
      // Not liked yet, so like it
      liked = true;
      likesArray.push(targetUser);
    }else{
      // Already liked, so unlike it
      liked = false;
      likesArray.splice(userIndex,1);
    }
    post.likes = likesArray;
    await post.save();
    return res.status(200).json({success:true,msg:"Post like status updated", liked, likes: likesArray });
  } catch (error) {
    return res.status(500).json({success:false,msg:"Internal Server Error"})
  }
})
export default PostRouter;
