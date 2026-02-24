import mongoose from "mongoose";
import User from "../models/User.js";
import { Conversation, Message } from "../models/Chat.js";

/* =========================================================
   1️⃣ ACCESS OR CREATE CHAT
========================================================= */
export const accessChat = async (req, res) => {
  try {
    const { userId } = req.body;
    const myId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    if (myId.toString() === userId.toString()) {
      return res.status(400).json({ message: "Cannot chat with yourself" });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let chat = await Conversation.findOne({
      isGroupChat: false,
      participants: { $all: [myId, userId] },
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
      participants: [myId, userId],
      unreadCounts: {
        [myId]: 0,
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
};

/* =========================================================
   2️⃣ FETCH SIDEBAR CHATS
========================================================= */
export const fetchChats = async (req, res) => {
  try {
    const myId = req.user._id;

    const chats = await Conversation.find({
      participants: myId,
      isDeleted: false,
      latestMessage: { $exists: true, $ne: null },
    })
      .populate("participants", "-password")
      .populate({
        path: "latestMessage",
        populate: { path: "sender", select: "name profilepic email" },
      })
      .sort({ lastMessageAt: -1 });

    res.status(200).json(chats);

  } catch (error) {
    console.error("Fetch chats error:", error);
    res.status(500).json({ message: "Error fetching chats" });
  }
};

/* =========================================================
   3️⃣ FETCH MESSAGES + RESET UNREAD
========================================================= */
export const fetchMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const myId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid chatId" });
    }

    const conversation = await Conversation.findById(chatId);

    if (!conversation || !conversation.participants.includes(myId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const messages = await Message.find({
      conversation: chatId,
      isDeleted: false,
    })
      .populate("sender", "name profilepic email")
      .sort({ createdAt: 1 });

    // Reset unread count
    conversation.unreadCounts.set(myId.toString(), 0);
    await conversation.save();

    res.status(200).json(messages);

  } catch (error) {
    console.error("Fetch messages error:", error);
    res.status(500).json({ message: "Error fetching messages" });
  }
};

/* =========================================================
   4️⃣ DELETE CHAT (AUTHORIZED)
========================================================= */
export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const myId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid chatId" });
    }

    const chat = await Conversation.findById(chatId);

    if (!chat || !chat.participants.includes(myId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    chat.isDeleted = true;
    await chat.save();

    res.json({ success: true });

  } catch (error) {
    console.error("Delete chat error:", error);
    res.status(500).json({ message: "Could not delete chat" });
  }
};

/* =========================================================
   5️⃣ DELETE MESSAGE (ONLY SENDER)
========================================================= */
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const myId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ message: "Invalid messageId" });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.sender.toString() !== myId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    message.isDeleted = true;
    await message.save();

    res.json({ success: true });

  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ message: "Could not delete message" });
  }
};