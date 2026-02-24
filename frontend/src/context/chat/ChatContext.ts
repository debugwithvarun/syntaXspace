import { createContext } from "react";
import { Socket } from "socket.io-client";

/* ================================
   USER
================================ */
export interface User {
  _id: string;
  name: string;
  email: string;
  username: string;
  profilepic: string;
}

/* ================================
   MESSAGE
================================ */
export interface Message {
  _id: string;
  sender: User | string;          // populated OR just id
  content: string;
  conversation: string;
  media?: string;
  readBy?: string[];
  isDeleted?: boolean;
  createdAt: string;
  updatedAt?: string;
}

/* ================================
   CHAT / CONVERSATION
================================ */
export interface Chat {
  _id: string;
  chatName?: string;
  isGroupChat: boolean;
  participants: User[];
  latestMessage?: Message;
  groupAdmin?: User;
  unreadCounts?: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

/* ================================
   CONTEXT PROPS
================================ */
type ChatContextProps = {
  socket: Socket | null;

  // UI state
  openChat: boolean;
  setOpenChat: (open: boolean) => void;

  // Chat state
  chats: Chat[];
  selectedChat: Chat | null;
  messages: Message[];

  // Core Actions
  setSelectedChat: (chat: Chat | null) => void;
  accessChat: (userId: string) => Promise<void>;
  fetchChats: () => Promise<void>;
  sendMessage: (content: string) => void;

  // Delete
  deleteMessage: (messageId: string) => void;
  deleteChat: (chatId: string) => Promise<void>;

  // Search
  searchResult: User[];
  setSearchResult: (users: User[]) => void;

  // Loading
  loadingChat: boolean;

  // Utilities
  clearMessages: () => void;
};

const ChatContext = createContext<ChatContextProps | null>(null);

export default ChatContext;