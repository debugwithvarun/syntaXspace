import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import ChatContext, {
  type Chat,
  type Message,
  type User,
} from "./ChatContext";
import { useAuth } from "@/hooks/useAuth";

const ENDPOINT = "http://localhost:8000";

const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { _id: currentUserId } = useAuth();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [openChat, setOpenChat] = useState(false);

  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const [searchResult, setSearchResult] = useState<User[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);

  const selectedChatRef = useRef<Chat | null>(null);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  /* ===============================
     SOCKET CONNECTION
  =============================== */
  useEffect(() => {
    if (!currentUserId) return;

    const newSocket = io(ENDPOINT, {
      withCredentials: true,
      transports: ["websocket"],
    });

    newSocket.emit("setup", currentUserId);

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [currentUserId]);

  /* ===============================
     FETCH CHATS (INITIAL LOAD)
  =============================== */
  const fetchChats = useCallback(async () => {
    if (!currentUserId) return;

    try {
      const res = await fetch(
        "http://localhost:8000/chat/fetch-chats",
        { credentials: "include" }
      );

      if (!res.ok) return;

      const data = await res.json();
      setChats(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch chats error:", err);
    }
  }, [currentUserId]);

  /* ===============================
     SOCKET LISTENERS
  =============================== */
  useEffect(() => {
    if (!socket) return;

    /* ---- RECEIVE MESSAGE ---- */
    const handleReceiveMessage = (newMessage: Message) => {
      const conversationId =
        typeof newMessage.conversation === "string"
          ? newMessage.conversation
          : newMessage.conversation?._id;
    
      setMessages((prev) => {
        // Prevent duplicate
        if (prev.find((m) => m._id === newMessage._id)) {
          return prev;
        }
    
        if (
          selectedChatRef.current &&
          selectedChatRef.current._id === conversationId
        ) {
          return [...prev, newMessage];
        }
    
        return prev;
      });
    };

    /* ---- SIDEBAR REALTIME UPDATE ---- */
    const handleConversationUpdated = (updatedConversation: Chat) => {
      setChats((prev) => {
        const exists = prev.find(
          (c) => c._id === updatedConversation._id
        );

        if (exists) {
          return prev
            .map((c) =>
              c._id === updatedConversation._id
                ? updatedConversation
                : c
            )
            .sort((a, b) => {
              const dateA =
                a.latestMessage?.createdAt || a.updatedAt;
              const dateB =
                b.latestMessage?.createdAt || b.updatedAt;

              return (
                new Date(dateB).getTime() -
                new Date(dateA).getTime()
              );
            });
        }

        return [updatedConversation, ...prev];
      });
    };

    /* ---- MESSAGE DELETED ---- */
    const handleMessageDeleted = (messageId: string) => {
      setMessages((prev) =>
        prev.filter((msg) => msg._id !== messageId)
      );
    };

    /* ---- CHAT DELETED ---- */
    const handleChatDeleted = (chatId: string) => {
      setChats((prev) =>
        prev.filter((c) => c._id !== chatId)
      );

      if (selectedChatRef.current?._id === chatId) {
        setSelectedChat(null);
        setMessages([]);
      }
    };

    socket.on("receive message", handleReceiveMessage);
    socket.on("conversation updated", handleConversationUpdated);
    socket.on("message deleted", handleMessageDeleted);
    socket.on("chat deleted", handleChatDeleted);

    return () => {
      socket.off("receive message", handleReceiveMessage);
      socket.off("conversation updated", handleConversationUpdated);
      socket.off("message deleted", handleMessageDeleted);
      socket.off("chat deleted", handleChatDeleted);
    };
  }, [socket]);

  /* ===============================
     ACCESS CHAT
  =============================== */
  const accessChat = async (userId: string) => {
    try {
      setLoadingChat(true);

      const res = await fetch(
        "http://localhost:8000/chat/access",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userId }),
        }
      );

      if (!res.ok) return;

      const chat: Chat = await res.json();

      setSelectedChat(chat);
      setOpenChat(true);

      setChats((prev) =>
        prev.find((c) => c._id === chat._id)
          ? prev
          : [chat, ...prev]
      );
    } catch (err) {
      console.error("Access chat error:", err);
    } finally {
      setLoadingChat(false);
    }
  };

  /* ===============================
     FETCH MESSAGES
  =============================== */
  useEffect(() => {
    if (!selectedChat || !socket) return;

    const loadMessages = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/chat/messages/${selectedChat._id}`,
          { credentials: "include" }
        );

        if (!res.ok) return;

        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);

        socket.emit("join chat", selectedChat._id);
      } catch (err) {
        console.error("Fetch messages error:", err);
      }
    };

    loadMessages();
  }, [selectedChat, socket]);

  /* ===============================
     SEND MESSAGE
  =============================== */
  const sendMessage = (content: string) => {
    if (!socket || !selectedChat || !content.trim()) return;

    socket.emit("send message", {
      content,
      conversationId: selectedChat._id,
      senderId: currentUserId,
    });
  };

  /* ===============================
     DELETE MESSAGE
  =============================== */
  const deleteMessage = (messageId: string) => {
    if (!socket || !selectedChat) return;

    socket.emit("delete message", {
      messageId,
      conversationId: selectedChat._id,
    });
  };

  /* ===============================
     DELETE CHAT
  =============================== */
  const deleteChat = async (chatId: string) => {
    try {
      await fetch(
        `http://localhost:8000/chat/delete/${chatId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      socket?.emit("delete chat", { chatId });
    } catch (err) {
      console.error("Delete chat error:", err);
    }
  };

  /* ===============================
     INITIAL LOAD
  =============================== */
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;