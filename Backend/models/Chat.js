// models/Chat.js

import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    isGroupChat: { type: Boolean, default: false },
    chatName: { type: String, trim: true },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },

    // Unread message count per participant userId (string key)
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },

    isDeleted: { type: Boolean, default: false },
    lastMessageAt: { type: Date },
  },
  { timestamps: true }
);

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: { type: String, trim: true },

    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    // Media (future)
    mediaUrl: { type: String, default: "" },
    mediaType: { type: String, enum: ["image", "video", "file", ""], default: "" },

    isDeleted: { type: Boolean, default: false },

    // 📬 Delivery receipts
    // deliveredTo: users who received the message (socket delivered)
    deliveredTo: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    ],

    // 👁️ Read receipts
    // readBy: users who have READ (opened that chat) the message
    readBy: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    ],
  },
  { timestamps: true }
);

export const Conversation = mongoose.model("Conversation", conversationSchema);
export const Message = mongoose.model("Message", messageSchema);