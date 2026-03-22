import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import ChatContext, {
  type Chat,
  type Message,
  type User,
  type CallState,
  type IncomingCallInfo,
  type MessageStatus,
} from "./ChatContext";
import { useAuth } from "@/hooks/useAuth";

// `const ENDPOINT = "http://localhost:8000";
// const BACKEND = "http://localhost:8000";`
const ENDPOINT = "http://16.171.197.228:8000";
const BACKEND = "http://16.171.197.228:8000";

const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { _id: currentUserId } = useAuth();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [openChat, setOpenChat] = useState(false);

  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const [searchResult, setSearchResult] = useState<User[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);

  // Online users
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Typing per conversation
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

  // Block state
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

  // Video call state
  const [callState, setCallState] = useState<CallState>("idle");
  const [callType, setCallType] = useState<"video" | "audio">("video");
  const [incomingCall, setIncomingCall] = useState<IncomingCallInfo | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const selectedChatRef = useRef<Chat | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const callTargetIdRef = useRef<string | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  /* ─── SOCKET CONNECTION ─── */
  useEffect(() => {
    if (!currentUserId) return;

    const newSocket = io(ENDPOINT, {
      withCredentials: true,
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      newSocket.emit("setup", currentUserId);
      // Request current online users list
      newSocket.emit("get-online-users");
    });

    // Handle initial online users list
    newSocket.on("online-users-list", (userIds: string[]) => {
      setOnlineUsers(new Set(userIds));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [currentUserId]);

  /* ─── FETCH BLOCKED USERS ─── */
  const fetchBlockedUsers = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const res = await fetch(`${BACKEND}/blocked-users`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      const ids = (data.data || []).map((u: User) => u._id);
      setBlockedUsers(ids);
    } catch (err) {
      console.error("Fetch blocked users error:", err);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchBlockedUsers();
  }, [fetchBlockedUsers]);

  const isBlocked = useCallback(
    (userId: string) => blockedUsers.includes(userId),
    [blockedUsers]
  );

  const blockUser = async (userId: string) => {
    try {
      await fetch(`${BACKEND}/block/${userId}`, { method: "PUT", credentials: "include" });
      setBlockedUsers((prev) => [...prev, userId]);
    } catch (err) {
      console.error("Block error:", err);
    }
  };

  const unblockUser = async (userId: string) => {
    try {
      await fetch(`${BACKEND}/unblock/${userId}`, { method: "PUT", credentials: "include" });
      setBlockedUsers((prev) => prev.filter((id) => id !== userId));
    } catch (err) {
      console.error("Unblock error:", err);
    }
  };

  /* ─── FETCH CHATS ─── */
  const fetchChats = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const res = await fetch(`${BACKEND}/chat/fetch-chats`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setChats(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch chats error:", err);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  /* ─── SOCKET EVENTS ─── */
  useEffect(() => {
    if (!socket) return;

    /* RECEIVE MESSAGE */
    const handleReceiveMessage = (newMessage: Message) => {
      const conversationId =
        typeof newMessage.conversation === "string"
          ? newMessage.conversation
          : (newMessage.conversation as unknown as Chat)?._id;

      setMessages((prev) => {
        if (prev.find((m) => m._id === newMessage._id)) return prev;
        if (selectedChatRef.current?._id === conversationId) {
          // Auto-mark as read when message arrives in active chat
          socket.emit("mark-read", { conversationId, userId: currentUserId });
          return [...prev, newMessage];
        }
        return prev;
      });
    };

    /* SIDEBAR UPDATE */
    const handleConversationUpdated = (updated: Chat) => {
      setChats((prev) => {
        const exists = prev.find((c) => c._id === updated._id);
        const next = exists
          ? prev.map((c) => (c._id === updated._id ? updated : c))
          : [updated, ...prev];
        return [...next].sort((a, b) => {
          const da = a.latestMessage?.createdAt || a.updatedAt;
          const db = b.latestMessage?.createdAt || b.updatedAt;
          return new Date(db).getTime() - new Date(da).getTime();
        });
      });
    };

    /* MESSAGE DELETED */
    const handleMessageDeleted = (messageId: string) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    };

    /* CHAT DELETED */
    const handleChatDeleted = (chatId: string) => {
      setChats((prev) => prev.filter((c) => c._id !== chatId));
      if (selectedChatRef.current?._id === chatId) {
        setSelectedChat(null);
        setMessages([]);
      }
    };

    /* DELIVERY RECEIPT */
    const handleDelivered = ({ messageId }: { messageId: string; conversationId: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, deliveredTo: [...(m.deliveredTo || []), { _id: "delivered" }] }
            : m
        )
      );
    };

    /* READ RECEIPT */
    const handleMessagesRead = ({ conversationId, readBy }: { conversationId: string; readBy: string }) => {
      if (selectedChatRef.current?._id === conversationId) {
        setMessages((prev) =>
          prev.map((m) => {
            const alreadyRead = m.readBy?.some((r) =>
              (typeof r === "string" ? r : r._id) === readBy
            );
            if (!alreadyRead) {
              return {
                ...m,
                readBy: [...(m.readBy || []), { _id: readBy }],
              };
            }
            return m;
          })
        );
      }
    };

    /* TYPING */
    const handleTyping = ({ conversationId }: { conversationId: string }) => {
      setTypingUsers((prev) => ({ ...prev, [conversationId]: true }));
    };
    const handleStopTyping = ({ conversationId }: { conversationId: string }) => {
      setTypingUsers((prev) => ({ ...prev, [conversationId]: false }));
    };

    /* ONLINE / OFFLINE */
    const handleUserOnline = (userId: string) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    };
    const handleUserOffline = (userId: string) => {
      setOnlineUsers((prev) => {
        const s = new Set(prev);
        s.delete(userId);
        return s;
      });
    };

    /* VIDEO CALLS */
    const handleIncomingCall = (data: IncomingCallInfo) => {
      setIncomingCall(data);
      setCallType(data.callType || "video");
      setCallState("incoming");
    };

    const handleCallAccepted = async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      if (!peerConnectionRef.current) return;
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      setCallState("active");
    };

    const handleCallRejected = () => { cleanupCall(); };

    const handleIceCandidate = async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      try {
        if (peerConnectionRef.current && candidate) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error("ICE error:", err);
      }
    };

    const handleCallEnded = () => { cleanupCall(); };

    socket.on("receive message", handleReceiveMessage);
    socket.on("conversation updated", handleConversationUpdated);
    socket.on("message deleted", handleMessageDeleted);
    socket.on("chat deleted", handleChatDeleted);
    socket.on("message-delivered", handleDelivered);
    socket.on("messages-read", handleMessagesRead);
    socket.on("user-typing", handleTyping);
    socket.on("user-stop-typing", handleStopTyping);
    socket.on("user-online", handleUserOnline);
    socket.on("user-offline", handleUserOffline);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-accepted", handleCallAccepted);
    socket.on("call-rejected", handleCallRejected);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("call-ended", handleCallEnded);

    return () => {
      socket.off("receive message", handleReceiveMessage);
      socket.off("conversation updated", handleConversationUpdated);
      socket.off("message deleted", handleMessageDeleted);
      socket.off("chat deleted", handleChatDeleted);
      socket.off("message-delivered", handleDelivered);
      socket.off("messages-read", handleMessagesRead);
      socket.off("user-typing", handleTyping);
      socket.off("user-stop-typing", handleStopTyping);
      socket.off("user-online", handleUserOnline);
      socket.off("user-offline", handleUserOffline);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-accepted", handleCallAccepted);
      socket.off("call-rejected", handleCallRejected);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("call-ended", handleCallEnded);
    };
  }, [socket, currentUserId]);

  /* ─── ACCESS CHAT ─── */
  const accessChat = async (userId: string) => {
    try {
      setLoadingChat(true);
      const res = await fetch(`${BACKEND}/chat/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) return;
      const chat: Chat = await res.json();
      setSelectedChat(chat);
      setOpenChat(true);
      setChats((prev) => (prev.find((c) => c._id === chat._id) ? prev : [chat, ...prev]));
    } catch (err) {
      console.error("Access chat error:", err);
    } finally {
      setLoadingChat(false);
    }
  };

  /* ─── FETCH MESSAGES WHEN CHAT CHANGES ─── */
  useEffect(() => {
    if (!selectedChat || !socket) return;

    const loadMessages = async () => {
      try {
        const res = await fetch(`${BACKEND}/chat/messages/${selectedChat._id}`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
        socket.emit("join chat", selectedChat._id);
        // Tell server to mark all as read
        socket.emit("mark-read", { conversationId: selectedChat._id, userId: currentUserId });
      } catch (err) {
        console.error("Fetch messages error:", err);
      }
    };

    loadMessages();

    return () => {
      // Leave the chat room when switching chats
      socket.emit("leave chat", selectedChat._id);
    };
  }, [selectedChat?._id, socket, currentUserId]);

  /* ─── SEND MESSAGE ─── */
  const sendMessage = (content: string) => {
    if (!socket || !selectedChat || !content.trim()) return;
    stopTyping();
    socket.emit("send message", {
      content,
      conversationId: selectedChat._id,
      senderId: currentUserId,
    });
  };

  /* ─── TYPING ─── */
  const startTyping = useCallback(() => {
    if (!socket || !selectedChat) return;
    socket.emit("typing", { conversationId: selectedChat._id, userId: currentUserId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  }, [socket, selectedChat, currentUserId]);

  const stopTyping = useCallback(() => {
    if (!socket || !selectedChat) return;
    socket.emit("stop-typing", { conversationId: selectedChat._id, userId: currentUserId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  }, [socket, selectedChat, currentUserId]);

  /* ─── DELETE MESSAGE ─── */
  const deleteMessage = (messageId: string) => {
    if (!socket || !selectedChat) return;
    socket.emit("delete message", { messageId, conversationId: selectedChat._id });
  };

  /* ─── DELETE CHAT ─── */
  const deleteChat = async (chatId: string) => {
    try {
      await fetch(`${BACKEND}/chat/delete/${chatId}`, { method: "DELETE", credentials: "include" });
      socket?.emit("delete chat", { chatId });
    } catch (err) {
      console.error("Delete chat error:", err);
    }
  };

  /* ─── GET MESSAGE STATUS ─── */
  const getMessageStatus = useCallback(
    (msg: Message): MessageStatus => {
      const senderId =
        typeof msg.sender === "string" ? msg.sender : (msg.sender as User)?._id;
      if (senderId !== currentUserId) return "read"; // incoming messages always appear read

      const hasRead = msg.readBy?.some((r) => {
        const id = typeof r === "string" ? r : r._id;
        return id !== currentUserId && id !== "delivered";
      });
      if (hasRead) return "read";

      const hasDelivered = msg.deliveredTo?.some((r) => {
        const id = typeof r === "string" ? r : r._id;
        return id !== currentUserId;
      });
      if (hasDelivered) return "delivered";

      return "sent";
    },
    [currentUserId]
  );

  /* ─── WEBRTC ─── */
  const createPeerConnection = (targetUserId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("ice-candidate", { targetUserId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    return pc;
  };

  const cleanupCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setCallState("idle");
    setIncomingCall(null);
    callTargetIdRef.current = null;
  };

  const initiateCall = async (
    targetUserId: string,
    targetInfo: { name: string; username: string; profilepic: string },
    type: "video" | "audio" = "video"
  ) => {
    if (!socket || !currentUserId) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        type === "video" ? { video: true, audio: true } : { video: false, audio: true }
      );
      localStreamRef.current = stream;
      setLocalStream(stream);
      setCallType(type);
      const pc = createPeerConnection(targetUserId);
      peerConnectionRef.current = pc;
      callTargetIdRef.current = targetUserId;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("call-user", { targetUserId, offer, callerId: currentUserId, callerInfo: targetInfo, callType: type });
      setCallState("calling");
    } catch (err) {
      console.error("Initiate call error:", err);
      cleanupCall();
    }
  };

  const acceptCall = async () => {
    if (!socket || !incomingCall) return;
    try {
      const type = incomingCall.callType || "video";
      const stream = await navigator.mediaDevices.getUserMedia(
        type === "video" ? { video: true, audio: true } : { video: false, audio: true }
      );
      localStreamRef.current = stream;
      setLocalStream(stream);
      setCallType(type);
      const pc = createPeerConnection(incomingCall.callerId);
      peerConnectionRef.current = pc;
      callTargetIdRef.current = incomingCall.callerId;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("call-accepted", { callerId: incomingCall.callerId, answer });
      setCallState("active");
    } catch (err) {
      console.error("Accept call error:", err);
      cleanupCall();
    }
  };

  const rejectCall = () => {
    if (!socket || !incomingCall) return;
    socket.emit("call-rejected", { callerId: incomingCall.callerId, reason: "rejected" });
    cleanupCall();
  };

  const endCall = () => {
    if (!socket || !callTargetIdRef.current) return;
    socket.emit("end-call", { targetUserId: callTargetIdRef.current });
    cleanupCall();
  };

  return (
    <ChatContext.Provider
      value={{
        socket,
        chats,
        selectedChat,
        setSelectedChat,
        messages,
        accessChat,
        sendMessage,
        fetchChats,
        openChat,
        setOpenChat,
        searchResult,
        setSearchResult,
        loadingChat,
        deleteMessage,
        deleteChat,
        clearMessages: () => setMessages([]),
        onlineUsers,
        typingUsers,
        startTyping,
        stopTyping,
        getMessageStatus,
        blockedUsers,
        blockUser,
        unblockUser,
        isBlocked,
        fetchBlockedUsers,
        callState,
        callType,
        incomingCall,
        localStream,
        remoteStream,
        initiateCall,
        acceptCall,
        rejectCall,
        endCall,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;