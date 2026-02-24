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

    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },

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

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Conversation = mongoose.model(
  "Conversation",
  conversationSchema
);

export const Message = mongoose.model(
  "Message",
  messageSchema
);