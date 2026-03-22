import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { Conversation, Message } from "../models/Chat.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

/* ============================================================
   Online users map: userId → Set of socketIds
   (one user can be open in multiple tabs)
============================================================ */
const onlineUsers = new Map(); // userId → Set<socketId>

/* Track which chat a socket is currently viewing
   socketId → conversationId */
const activeChatMap = new Map();

const addOnlineUser = (userId, socketId) => {
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId).add(socketId);
};

const removeOnlineUser = (userId, socketId) => {
  const set = onlineUsers.get(userId);
  if (!set) return;
  set.delete(socketId);
  if (set.size === 0) onlineUsers.delete(userId);
};

const isUserOnline = (userId) => onlineUsers.has(userId);

export const setupSocket = (server, app) => {
  const io = new Server(server, {
    cors: {
      // FIX 8: Use exact S3 origin from env (same as Express CORS)
      origin: process.env.CLIENT_URL,
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    },
  });

  // FIX 8: Token-based socket auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Unauthorized: no token"));
    }
    try {
      const decoded = jwt.verify(token, process.env.SECRET);
      socket.user = decoded;
      next();
    } catch {
      return next(new Error("Unauthorized: invalid token"));
    }
  });

  // Attach io to express app so routes can emit notifications
  app.use((req, _res, next) => {
    req.io = io;
    next();
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    /* =========================================
       SETUP — user joins their personal room
    ========================================= */
    socket.on("setup", (userId) => {
      socket.join(userId);
      socket.userId = userId;
      addOnlineUser(userId, socket.id);

      // Send the requesting socket the current list of online users
      socket.emit("online-users-list", [...onlineUsers.keys()]);

      // Broadcast to everyone else that this user is online
      socket.broadcast.emit("user-online", userId);
      console.log(`User ${userId} online`);
    });

    /* =========================================
       GET ONLINE USERS (on demand)
    ========================================= */
    socket.on("get-online-users", () => {
      socket.emit("online-users-list", [...onlineUsers.keys()]);
    });

    /* =========================================
       JOIN CHAT — user opens a conversation
    ========================================= */
    socket.on("join chat", async (chatId) => {
      socket.join(chatId);
      activeChatMap.set(socket.id, chatId);

      // Mark all messages in this chat as read for this user
      if (socket.userId) {
        await markMessagesAsRead(io, socket.userId, chatId);
      }
    });

    /* =========================================
       LEAVE CHAT — user navigates away
    ========================================= */
    socket.on("leave chat", (chatId) => {
      socket.leave(chatId);
      if (activeChatMap.get(socket.id) === chatId) {
        activeChatMap.delete(socket.id);
      }
    });

    /* =========================================
       SEND MESSAGE
    ========================================= */
    socket.on("send message", async (data) => {
      try {
        const { content, conversationId, senderId } = data;

        // Load conversation with participants
        const conversation = await Conversation.findById(conversationId).populate(
          "participants", "_id block"
        );
        if (!conversation) return;

        const otherParticipant = conversation.participants.find(
          (p) => p._id.toString() !== senderId.toString()
        );

        // Block check
        if (
          otherParticipant?.block?.some(
            (id) => id.toString() === senderId.toString()
          )
        ) {
          socket.emit("message-blocked", {
            message: "You are blocked by this user.",
          });
          return;
        }

        const recipientId = otherParticipant?._id.toString();

        // Determine delivery/read status immediately
        const recipientActive = activeChatMap.get(
          [...(onlineUsers.get(recipientId) || [])]?.[0]
        ) === conversationId;

        const deliveredTo = recipientId && isUserOnline(recipientId)
          ? [recipientId]
          : [];

        const readBy = recipientActive ? [senderId, recipientId] : [senderId];

        // Create message
        const message = await Message.create({
          sender: senderId,
          content,
          conversation: conversationId,
          deliveredTo,
          readBy,
        });

        const fullMessage = await Message.findById(message._id)
          .populate("sender", "name profilepic username email")
          .populate("conversation");

        // Update conversation latest message
        const updatedConversation = await Conversation.findByIdAndUpdate(
          conversationId,
          {
            latestMessage: message._id,
            lastMessageAt: new Date(),
          },
          { new: true }
        )
          .populate("participants", "-password -block")
          .populate({
            path: "latestMessage",
            populate: { path: "sender", select: "name profilepic email username" },
          });

        // Emit to all participants' personal rooms
        updatedConversation.participants.forEach((user) => {
          io.to(user._id.toString()).emit("receive message", fullMessage);
          io.to(user._id.toString()).emit("conversation updated", updatedConversation);
        });

        // ─── If recipient is NOT actively on this chat → send notification ───
        if (recipientId && !recipientActive) {
          const sender = await User.findById(senderId, "name username profilepic");
          if (sender) {
            // Avoid duplicate new_message notifications (upsert last one)
            await Notification.deleteMany({
              recipient: recipientId,
              sender: senderId,
              type: "new_message",
            });

            const notif = await Notification.create({
              recipient: recipientId,
              sender: senderId,
              type: "new_message",
              message: `${sender.name}: ${content.slice(0, 60)}${content.length > 60 ? "…" : ""}`,
              link: `/chat`,
            });
            const populated = await notif.populate("sender", "name username profilepic");
            io.to(recipientId).emit("new-notification", populated);
          }
        }

        // ─── Delivery receipt ───
        // If recipient is online (even if not on this chat), mark as delivered
        if (recipientId && isUserOnline(recipientId) && deliveredTo.length > 0) {
          await Message.updateOne(
            { _id: message._id },
            { $addToSet: { deliveredTo: recipientId } }
          );
          // Notify sender that message was delivered
          io.to(senderId).emit("message-delivered", {
            messageId: message._id,
            conversationId,
          });
        }

      } catch (err) {
        console.error("Send message error:", err);
      }
    });

    /* =========================================
       MARK MESSAGES AS READ (manual trigger)
    ========================================= */
    socket.on("mark-read", async ({ conversationId, userId }) => {
      await markMessagesAsRead(io, userId, conversationId);
    });

    /* =========================================
       DELETE MESSAGE
    ========================================= */
    socket.on("delete message", async ({ messageId, conversationId }) => {
      await Message.findByIdAndUpdate(messageId, { isDeleted: true });

      const conversation = await Conversation.findById(conversationId);
      conversation?.participants.forEach((user) => {
        io.to(user.toString()).emit("message deleted", messageId);
      });
    });

    /* =========================================
       DELETE CHAT
    ========================================= */
    socket.on("delete chat", async ({ chatId }) => {
      const conversation = await Conversation.findById(chatId);
      if (!conversation) return;
      conversation.participants.forEach((user) => {
        io.to(user.toString()).emit("chat deleted", chatId);
      });
    });

    /* =========================================
       TYPING INDICATOR
    ========================================= */
    socket.on("typing", ({ conversationId, userId }) => {
      socket.to(conversationId).emit("user-typing", { conversationId, userId });
    });

    socket.on("stop-typing", ({ conversationId, userId }) => {
      socket.to(conversationId).emit("user-stop-typing", { conversationId, userId });
    });

    /* ==========================================
       VIDEO CALL — WebRTC Signaling
    =========================================== */
    socket.on("call-user", ({ targetUserId, offer, callerId, callerInfo }) => {
      io.to(targetUserId).emit("incoming-call", { offer, callerId, callerInfo });
    });

    socket.on("call-accepted", ({ callerId, answer }) => {
      io.to(callerId).emit("call-accepted", { answer });
    });

    socket.on("call-rejected", ({ callerId, reason }) => {
      io.to(callerId).emit("call-rejected", { reason });
    });

    socket.on("ice-candidate", ({ targetUserId, candidate }) => {
      io.to(targetUserId).emit("ice-candidate", { candidate });
    });

    socket.on("end-call", ({ targetUserId }) => {
      io.to(targetUserId).emit("call-ended");
    });

    /* =========================================
       DISCONNECT
    ========================================= */
    socket.on("disconnect", () => {
      activeChatMap.delete(socket.id);
      if (socket.userId) {
        removeOnlineUser(socket.userId, socket.id);
        if (!isUserOnline(socket.userId)) {
          io.emit("user-offline", socket.userId);
          console.log(`User ${socket.userId} offline`);
        }
      }
    });
  });

  return io;
};

/* ============================================================
   HELPER: Mark all unread messages in a chat as read
============================================================ */
async function markMessagesAsRead(io, userId, conversationId) {
  try {
    // Find messages in this chat not yet read by this user
    const updated = await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        readBy: { $ne: userId },
        isDeleted: false,
      },
      { $addToSet: { readBy: userId } }
    );

    if (updated.modifiedCount > 0) {
      // Notify the sender(s) that their messages were read
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;

      conversation.participants.forEach((participantId) => {
        if (participantId.toString() !== userId) {
          io.to(participantId.toString()).emit("messages-read", {
            conversationId,
            readBy: userId,
          });
        }
      });
    }
  } catch (err) {
    console.error("Mark read error:", err);
  }
}