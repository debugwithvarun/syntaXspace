import express from "express";
import Network from "../models/Network.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

const Networkrouter = express.Router();


// --------------------- Friend Request Logic ----------------------

Networkrouter.route("/sent-request").put(async (req, res) => {
  try {
    const { target } = req.body;
    const username = req.data.username;

    // Fetch basic info to store in the Network (Requests) collection
    // Note: Assuming Network collection still stores snapshots/objects for requests. 
    // If Network also uses IDs, change this to store just _id.
    const target_data = await User.findOne(
      { username: target },
      { username: 1, name: 1, profilepic: 1 }
    );
    const sender_data = await User.findOne(
      { username: username },
      { username: 1, name: 1, profilepic: 1 }
    );

    if (!target_data || !sender_data) {
        return res.status(404).json({ msg: "User not found" });
    }

    const senderNetwork = await Network.findOne({
      username: username,
      "requsetSent.username": target,
    });
    if (senderNetwork) {
      return res.status(400).json({ msg: "Request already sent to this user." });
    }

    const targetNetwork = await Network.findOne({
      username: target,
      "requsetGet.username": username,
    });
    if (targetNetwork) {
      return res.status(400).json({ msg: "You already have a pending request from this user." });
    }

    await Network.updateOne(
      { username: username },
      { $push: { requsetSent: target_data } }
    );

    await Network.updateOne(
      { username: target },
      { $push: { requsetGet: sender_data } }
    );

    // 🔔 Create a notification for the target user
    const senderUser = await User.findOne({ username: username }, { _id: 1 });
    const targetUser = await User.findOne({ username: target }, { _id: 1 });
    if (senderUser && targetUser) {
      const notif = await Notification.create({
        recipient: targetUser._id,
        sender: senderUser._id,
        type: "follow_request",
        message: `${sender_data.name} sent you a follow request`,
        link: `/profile/${username}`,
      });
      // Emit real-time notification to target if online
      if (req.io) {
        const populated = await notif.populate("sender", "name username profilepic");
        req.io.to(targetUser._id.toString()).emit("new-notification", populated);
      }
    }

    res.status(200).json({ msg: "Invite Sent!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal Server Error!" });
  }
});

Networkrouter.route("/check-status/:target").get(async (req, res) => {
  const targetUsername = req.params.target;
  const { username } = req.data;

  try {
    // 1. Get the target User's ID first
    const targetUser = await User.findOne({ username: targetUsername }, { _id: 1 });
    
    if (!targetUser) return res.json({ status: "idle" });

    // 2. Check if this ID exists in the current user's 'following' list
    const isFollowing = await User.findOne({
      username: username,
      following: targetUser._id, // Direct ID check in array
    });

    if (isFollowing) {
      return res.json({ status: "already" });
    } 
    
    // 3. Check Pending Requests (Network collection)
    const pendingRequest = await Network.findOne({
      username: username,
      "requsetSent.username": targetUsername,
    });

    if (pendingRequest) {
      return res.json({ status: "sent" });
    } else {
      return res.json({ status: "idle" });
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

Networkrouter.route("/delete-sent-request/:username").delete(async (req, res) => {
  try {
    const { username } = req.data;
    const targetuser = req.params.username;

    await Network.updateOne(
      { username: username },
      { $pull: { requsetSent: { username: targetuser } } }
    );
    await Network.updateOne(
      { username: targetuser },
      { $pull: { requsetGet: { username: username } } }
    );

    return res.status(200).json({ msg: "Sent Request removed successfully" });
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

Networkrouter.route("/delete-recieve-request/:username").delete(async (req, res) => {
  try {
    const { username } = req.data;
    const targetuser = req.params.username;

    await Network.updateOne(
      { username: username },
      { $pull: { requsetGet: { username: targetuser } } }
    );
    await Network.updateOne(
      { username: targetuser },
      { $pull: { requsetSent: { username: username } } }
    );

    return res.status(200).json({ msg: "Invite removed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});


// --------------------- Follower/Following Updates ----------------------

Networkrouter.route("/add-receive-request/:username").put(async (req, res) => {
  try {
    const { username } = req.data; // current user (being followed)
    const targetUsername = req.params.username; // follower (the one who sent request)

    // 1. Get IDs of both users
    const currentUser = await User.findOne({ username: username });
    const targetUser = await User.findOne({ username: targetUsername });

    if (!currentUser || !targetUser) {
        return res.status(404).json({ msg: "User not found" });
    }

    // 2. Remove from Network Requests
    await Network.updateOne(
      { username: username },
      { $pull: { requsetGet: { username: targetUsername } } }
    );
    await Network.updateOne(
      { username: targetUsername },
      { $pull: { requsetSent: { username: username } } }
    );

    // 3. Update User Lists (Push IDs only)
    await User.updateOne(
      { _id: currentUser._id },
      { $addToSet: { follower: targetUser._id } } // Prevent duplicates with addToSet
    );
    await User.updateOne(
      { _id: targetUser._id },
      { $addToSet: { following: currentUser._id } }
    );

    // 4. Feed Update: Add existing posts of "username" to targetuser's feed
    // currentUser.post contains IDs of posts
    if (currentUser.post && currentUser.post.length > 0) {
      await User.updateOne(
        { _id: targetUser._id },
        {
          $addToSet: {
            feeds: { $each: currentUser.post },
          },
        }
      );
    }

    // 🔔 Notify the requester that their follow was accepted
    const notif = await Notification.create({
      recipient: targetUser._id,
      sender: currentUser._id,
      type: "follow_accepted",
      message: `${currentUser.name} accepted your follow request`,
      link: `/profile/${username}`,
    });
    if (req.io) {
      const populated = await notif.populate("sender", "name username profilepic");
      req.io.to(targetUser._id.toString()).emit("new-notification", populated);
    }

    return res.status(200).json({ msg: "Invite accepted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

Networkrouter.route("/get-follower-info").get(async (req, res) => {
  try {
    const { username } = req.data;

    // Use .populate() because 'follower' is now an array of IDs
    const user = await User.findOne(
      { username: username },
      { follower: 1, _id: 0 }
    ).populate({
        path: "follower",
        select: "name username profilepic" // Only fetch needed fields
    });

    res.status(200).json({ msg: "okey", data: user.follower });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal Server Error", data: [] });
  }
});

Networkrouter.route("/remove-follower/:username").delete(async (req, res) => {
  try {
    const { username } = req.data; // current user
    const targetUsername = req.params.username; // follower to remove

    // 1. Resolve usernames to IDs
    const currentUser = await User.findOne({ username });
    const targetUser = await User.findOne({ username: targetUsername });

    if(!currentUser || !targetUser) return res.status(404).json({msg: "User not found"});

    // 2. Pull IDs from arrays
    await User.updateOne(
      { _id: currentUser._id },
      { $pull: { follower: targetUser._id } }
    );
    await User.updateOne(
      { _id: targetUser._id },
      { $pull: { following: currentUser._id } }
    );

    // 3. Remove posts from feed
    if (currentUser.post && currentUser.post.length > 0) {
      await User.updateOne(
        { _id: targetUser._id },
        {
          $pull: {
            feeds: { $in: currentUser.post },
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

    // Use .populate()
    const user = await User.findOne(
      { username: username },
      { following: 1, _id: 0 }
    ).populate({
        path: "following",
        select: "name username profilepic"
    });

    res.status(200).json({ msg: "okey", data: user.following });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal Server Error", data: [] });
  }
});

Networkrouter.route("/remove-following/:username").delete(async (req, res) => {
  try {
    const { username } = req.data; // current user (unfollowing)
    const targetUsername = req.params.username; // user being unfollowed

    const currentUser = await User.findOne({ username });
    const targetUser = await User.findOne({ username: targetUsername });

    if(!currentUser || !targetUser) return res.status(404).json({msg: "User not found"});

    // Pull IDs
    await User.updateOne(
      { _id: currentUser._id },
      { $pull: { following: targetUser._id } }
    );
    await User.updateOne(
      { _id: targetUser._id },
      { $pull: { follower: currentUser._id } }
    );

    // Remove posts from feed
    if (targetUser.post && targetUser.post.length > 0) {
      await User.updateOne(
        { _id: currentUser._id },
        {
          $pull: {
            feeds: { $in: targetUser.post },
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

    // Populate both follower and following arrays
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
    )
    .populate("follower", "name username profilepic")
    .populate("following", "name username profilepic");

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