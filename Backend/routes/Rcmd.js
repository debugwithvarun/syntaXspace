import express from "express";
import User from "../models/User.js";
import Network from "../models/Network.js";

const Rcmdrouter = express.Router();

// ✅ Get Suggested Users (excluding deleted or hidden users)
Rcmdrouter.route("/get-rcmd").get(async (req, res) => {
  try {
    const data = req.data;

    const [networkData, userData] = await Promise.all([
      Network.findOne(
        { username: data.username },
        { requsetSent: 1, requsetGet: 1 }
      ),
      User.findOne(
        { username: data.username },
        { following: 1 }
      ),
    ]);

    const sentList = networkData?.requsetSent?.map((u) => u.username) || [];
    const receivedList = networkData?.requsetGet?.map((u) => u.username) || [];
    const followingList = userData?.following?.map((u) => u.username) || [];

    const excludeList = [...sentList, ...receivedList, ...followingList, data.username];

    // ✅ Fetch only active (non-deleted) users for suggestions
    const getUsers = await User.find(
      {
        username: { $nin: excludeList },
        isDeleted: { $ne: true },  // hide users who are soft-deleted
      },
      { username: 1, name: 1, profilepic: 1, _id: 0 }
    );

    return res.status(200).json({ rcmd: getUsers });
  } catch (error) {
    console.error("❌ Error in /get-rcmd:", error);
    return res.status(500).json({ msg: "Server Error" });
  }
});

export default Rcmdrouter;
