import { Server } from "socket.io";
import { Conversation, Message } from "../models/Chat.js";

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    /* =========================
       SETUP USER ROOM
    ========================= */
    socket.on("setup", (userId) => {
      socket.join(userId);
    });

    /* =========================
       JOIN CHAT ROOM
    ========================= */
    socket.on("join chat", (chatId) => {
      socket.join(chatId);
    });

    /* =========================
       SEND MESSAGE
    ========================= */
    socket.on("send message", async (data) => {
      try {
        const { content, conversationId, senderId } = data;

        const message = await Message.create({
          sender: senderId,
          content,
          conversation: conversationId,
        });

        const fullMessage = await Message.findById(message._id)
          .populate("sender", "name profilepic email")
          .populate("conversation");

        // 🔥 UPDATE CONVERSATION PROPERLY
        const updatedConversation = await Conversation.findByIdAndUpdate(
          conversationId,
          {
            latestMessage: message._id,
            lastMessageAt: new Date(),
            $inc: { [`unreadCounts.${senderId}`]: 0 },
          },
          { new: true }
        )
          .populate("participants", "-password")
          .populate({
            path: "latestMessage",
            populate: {
              path: "sender",
              select: "name profilepic email",
            },
          });

        // 🔥 Emit message to all participants
        updatedConversation.participants.forEach((user) => {
          io.to(user._id.toString()).emit("receive message", fullMessage);
          io.to(user._id.toString()).emit("conversation updated", updatedConversation);
        });

      } catch (err) {
        console.error("Send message error:", err);
      }
    });

    /* =========================
       DELETE MESSAGE
    ========================= */
    socket.on("delete message", async ({ messageId, conversationId }) => {
      await Message.findByIdAndUpdate(messageId, {
        isDeleted: true,
      });

      const conversation = await Conversation.findById(conversationId);

      conversation.participants.forEach((user) => {
        io.to(user.toString()).emit("message deleted", messageId);
      });
    });

    /* =========================
       DELETE CHAT
    ========================= */
    socket.on("delete chat", async ({ chatId }) => {
      const conversation = await Conversation.findById(chatId);

      if (!conversation) return;

      conversation.participants.forEach((user) => {
        io.to(user.toString()).emit("chat deleted", chatId);
      });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  });
};