import express from "express";
import Network from "../models/Network.js";
import User from "../models/User.js";

const Networkrouter = express.Router();

Networkrouter.route("/sent-request").put(async (req, res) => {
  try {
    const { target } = req.body;
    const username = req.data.username;

    const target_data = await User.findOne(
      { username: target },
      { username: 1, name: 1, profilepic: 1, _id: 0 }
    );
    const sender_data = await User.findOne(
      { username: username },
      { username: 1, name: 1, profilepic: 1, _id: 0 }
    );

    const senderNetwork = await Network.findOne({
      username: username,
      "requsetSent.username": target,
    });
    if (senderNetwork) {
      return res
        .status(400)
        .json({ msg: "Request already sent to this user." });
    }

    const targetNetwork = await Network.findOne({
      username: target,
      "requsetGet.username": username,
    });
    if (targetNetwork) {
      return res
        .status(400)
        .json({ msg: "You already have a pending request from this user." });
    }

    await Network.updateOne(
      { username: username },
      { $push: { requsetSent: target_data } }
    );

    await Network.updateOne(
      { username: target },
      { $push: { requsetGet: sender_data } }
    );

    res.status(200).json({ msg: "Invite Sent!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal Server Error!" });
  }
});

Networkrouter.route("/check-status/:target").get(async (req, res) => {
  const target = req.params.target;
  const { username } = req.data;

  try {
    let status = await User.findOne({
      username: username,
      "following.username": target,
    });

    if (status) {
      return res.json({ status: "already" });
    } else {
      status = await Network.findOne({
        username: username,
        "requsetSent.username": target,
      });

      if (status) {
        return res.json({ status: "sent" });
      } else {
        return res.json({ status: "idle" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal Server Error!" });
  }
});

Networkrouter.route("/get-sent-requests").get(async (req, res) => {
  try {
    const { username } = req.data;

    const { requsetSent } = await Network.findOne(
      { username: username },
      { requsetSent: 1, _id: 0 }
    );
    res.status(200).json({ msg: "okey", data: requsetSent });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal Server Error", data: [] });
  }
});

Networkrouter
  .route("/delete-sent-request/:username")
  .delete(async (req, res) => {
    try {
      const { username } = req.data;
      const targetuser = req.params.username;

      const result1 = await Network.updateOne(
        { username: username },
        { $pull: { requsetSent: { username: targetuser } } }
      );
      const result2 = await Network.updateOne(
        { username: targetuser },
        { $pull: { requsetGet: { username: username } } }
      );
      // console.log("first : ", result1);
      // console.log("second : ", result2);
      return res
        .status(200)
        .json({ msg: "Sent Request removed successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  });

Networkrouter.route("/get-recieve-requests").get(async (req, res) => {
  try {
    const { username } = req.data;

    const { requsetGet } = await Network.findOne(
      { username: username },
      { requsetGet: 1, _id: 0 }
    );

    res.status(200).json({ msg: "okey", data: requsetGet });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal Servel Error", data: [] });
  }
});

Networkrouter
  .route("/delete-recieve-request/:username")
  .delete(async (req, res) => {
    try {
      const { username } = req.data;
      const targetuser = req.params.username;

      const result1 = await Network.updateOne(
        { username: username },
        { $pull: { requsetGet: { username: targetuser } } }
      );
      const result2 = await Network.updateOne(
        { username: targetuser },
        { $pull: { requsetSent: { username: username } } }
      );
      // console.log("first : ", result1);
      // console.log("second : ", result2);
      return res.status(200).json({ msg: "Invite  removed successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  });

// ✅ ACCEPT FOLLOW REQUEST -> also fill feeds with existing posts
Networkrouter
  .route("/add-receive-request/:username")
  .put(async (req, res) => {
    try {
      const { username } = req.data; // current user (being followed)
      const targetuser = req.params.username; // follower (the one who sent request)

      const userData = await User.findOne(
        { username: username },
        { username: 1, name: 1, profilepic: 1, _id: 0 }
      );
      const targetData = await User.findOne(
        { username: targetuser },
        { username: 1, name: 1, profilepic: 1, _id: 0 }
      );

      await Network.updateOne(
        { username: username },
        { $pull: { requsetGet: { username: targetuser } } }
      );
      await Network.updateOne(
        { username: targetuser },
        { $pull: { requsetSent: { username: username } } }
      );

      await User.updateOne(
        { username: username },
        { $push: { follower: targetData } }
      );
      await User.updateOne(
        { username: targetuser },
        { $push: { following: userData } }
      );

      // ✅ add ALL existing posts of "username" into targetuser's feed
      const followedUser = await User.findOne(
        { username: username },
        { post: 1, _id: 0 }
      );

      if (
        followedUser &&
        Array.isArray(followedUser.post) &&
        followedUser.post.length > 0
      ) {
        await User.updateOne(
          { username: targetuser },
          {
            $addToSet: {
              feeds: { $each: followedUser.post },
            },
          }
        );
      }

      return res.status(200).json({ msg: "Invite accept successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  });

Networkrouter.route("/get-follower-info").get(async (req, res) => {
  try {
    const { username } = req.data;

    const { follower } = await User.findOne(
      { username: username },
      { follower: 1, _id: 0 }
    );

    res.status(200).json({ msg: "okey", data: follower });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal Server Error", data: [] });
  }
});

// ✅ REMOVE FOLLOWER -> also remove your posts from their feed
Networkrouter
  .route("/remove-follower/:username")
  .delete(async (req, res) => {
    try {
      const { username } = req.data; // current user (being followed)
      const targetuser = req.params.username; // follower to remove

      await User.updateOne(
        { username: username },
        { $pull: { follower: { username: targetuser } } }
      );
      await User.updateOne(
        { username: targetuser },
        { $pull: { following: { username: username } } }
      );

      // ✅ remove all posts of "username" from targetuser's feed
      const myPostsDoc = await User.findOne(
        { username },
        { post: 1, _id: 0 }
      );

      if (
        myPostsDoc &&
        Array.isArray(myPostsDoc.post) &&
        myPostsDoc.post.length > 0
      ) {
        await User.updateOne(
          { username: targetuser },
          {
            $pull: {
              feeds: { $in: myPostsDoc.post },
            },
          }
        );
      }

      return res.status(200).json({ msg: "Remove successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  });

Networkrouter.route("/get-following-info").get(async (req, res) => {
  try {
    const { username } = req.data;

    const { following } = await User.findOne(
      { username: username },
      { following: 1, _id: 0 }
    );

    res.status(200).json({ msg: "okey", data: following });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal Server Error", data: [] });
  }
});

// ✅ UNFOLLOW SOMEONE -> also remove their posts from your feed
Networkrouter
  .route("/remove-following/:username")
  .delete(async (req, res) => {
    try {
      const { username } = req.data; // current user (who is unfollowing)
      const targetuser = req.params.username; // user being unfollowed

      await User.updateOne(
        { username: username },
        { $pull: { following: { username: targetuser } } }
      );
      await User.updateOne(
        { username: targetuser },
        { $pull: { follower: { username: username } } }
      );

      // ✅ remove all posts of "targetuser" from current user's feed
      const targetPostsDoc = await User.findOne(
        { username: targetuser },
        { post: 1, _id: 0 }
      );

      if (
        targetPostsDoc &&
        Array.isArray(targetPostsDoc.post) &&
        targetPostsDoc.post.length > 0
      ) {
        await User.updateOne(
          { username },
          {
            $pull: {
              feeds: { $in: targetPostsDoc.post },
            },
          }
        );
      }

      return res.status(200).json({ msg: "Remove successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  });

Networkrouter.route("/get-network-info/:username").get(async (req, res) => {
  try {
    const target_user = req.params.username;

    const user = await User.findOne(
      { username: target_user },
      {
        _id: 0,
        follower: 1,
        following: 1,
        bio: 1,
        skills: 1,
        post: 1,
        name: 1,
        username: 1,
        verified: 1,
        profilepic: 1,
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const followersCount = user.follower?.length || 0;
    const followingCount = user.following?.length || 0;
    const postCount = user.post?.length || 0;

    return res.status(200).json({
      success: true,
      data: {
        name: user.name,
        username: user.username,
        verified: user.verified,
        profilepic: user.profilepic,
        followersCount,
        followingCount,
        postCount,
        followers: user.follower,
        following: user.following,
        bio: user.bio,
        skills: user.skills,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default Networkrouter;
