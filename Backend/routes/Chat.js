import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import { Conversation, Message } from "../models/Chat.js";

const chatRouter = express.Router();

/* =========================================================
   1️⃣ SEARCH USERS
========================================================= */
chatRouter.get("/users", async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Fetch the current user's block list
    const currentUser = await User.findById(currentUserId, { block: 1 });
    const myBlockedIds = currentUser?.block || [];

    // Also find users who have blocked the current user
    const usersWhoBlockedMe = await User.find(
      { block: currentUserId },
      { _id: 1 }
    );
    const blockedByIds = usersWhoBlockedMe.map((u) => u._id);

    // All IDs to exclude from search
    const excludeIds = [currentUserId, ...myBlockedIds, ...blockedByIds];

    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { username: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find({
      ...keyword,
      _id: { $nin: excludeIds },
    }).select("name username profilepic email");

    res.status(200).json(users);
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ message: "Error searching users" });
  }
});

/* =========================================================
   2️⃣ ACCESS OR CREATE CHAT
========================================================= */
chatRouter.post("/access", async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user?._id || req.user?.id;

    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized user missing ID" }); 
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    if (currentUserId.toString() === userId.toString()) {
      return res.status(400).json({ message: "Cannot chat with yourself" });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let chat = await Conversation.findOne({
      isGroupChat: false,
      participants: { $all: [currentUserId, userId] },
      isDeleted: false,
    })
      .populate("participants", "-password")
      .populate({
        path: "latestMessage",
        populate: { path: "sender", select: "name profilepic email" },
      });

    if (chat) return res.status(200).json(chat);

    const newChat = await Conversation.create({
      isGroupChat: false,
      participants: [currentUserId, userId],
      unreadCounts: {
        [currentUserId]: 0,
        [userId]: 0,
      },
    });

    const fullChat = await Conversation.findById(newChat._id)
      .populate("participants", "-password");

    res.status(201).json(fullChat);

  } catch (error) {
    console.error("Access chat error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================================================
   3️⃣ FETCH SIDEBAR CHATS
========================================================= */
chatRouter.get("/fetch-chats", async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const chats = await Conversation.find({
      participants: currentUserId,
      isDeleted: false,
      latestMessage: { $exists: true, $ne: null },
    })
      .populate("participants", "-password")
      .populate({
        path: "latestMessage",
        populate: { path: "sender", select: "name profilepic email" },
      })
      .sort({ lastMessageAt: -1, updatedAt: -1 });

    res.status(200).json(chats);
  } catch (error) {
    console.error("Fetch chats error:", error);
    res.status(500).json({ message: "Error fetching chats" });
  }
});

/* =========================================================
   4️⃣ FETCH MESSAGES + RESET UNREAD
========================================================= */
chatRouter.get("/messages/:chatId", async (req, res) => {
  try {
    const { chatId } = req.params;
    const currentUserId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid chatId" });
    }

    const conversation = await Conversation.findById(chatId);

    if (!conversation || !conversation.participants.includes(currentUserId)) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const messages = await Message.find({
      conversation: chatId,
      isDeleted: false,
    })
      .populate("sender", "name profilepic email username")
      .populate("readBy", "_id name")
      .populate("deliveredTo", "_id name")
      .sort({ createdAt: 1 });

    // Mark messages as read (HTTP path — socket will also handle this)
    await Message.updateMany(
      {
        conversation: chatId,
        sender: { $ne: currentUserId },
        readBy: { $ne: currentUserId },
        isDeleted: false,
      },
      { $addToSet: { readBy: currentUserId } }
    );

    // Reset unread count
    conversation.unreadCounts.set(currentUserId.toString(), 0);
    await conversation.save();


    res.status(200).json(messages);

  } catch (error) {
    console.error("Fetch messages error:", error);
    res.status(500).json({ message: "Error fetching messages" });
  }
});

/* =========================================================
   5️⃣ SOFT DELETE CHAT (AUTH PROTECTED)
========================================================= */
chatRouter.delete("/delete/:chatId", async (req, res) => {
  try {
    const { chatId } = req.params;
    const currentUserId = req.user._id;

    const conversation = await Conversation.findById(chatId);

    if (!conversation || !conversation.participants.includes(currentUserId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    conversation.isDeleted = true;
    await conversation.save();

    res.json({ success: true });

  } catch (error) {
    console.error("Delete chat error:", error);
    res.status(500).json({ message: "Could not delete chat" });
  }
});

/* =========================================================
   6️⃣ SOFT DELETE MESSAGE (ONLY SENDER CAN DELETE)
========================================================= */
chatRouter.delete("/message/:messageId", async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.sender.toString() !== currentUserId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    message.isDeleted = true;
    await message.save();

    res.json({ success: true });

  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ message: "Could not delete message" });
  }
});

export default chatRouter;