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
   MESSAGE (full receipt info)
================================ */
export interface Message {
  _id: string;
  sender: User | string;
  content: string;
  conversation: string;
  mediaUrl?: string;
  mediaType?: "image" | "video" | "file" | "";
  readBy?: { _id: string; name?: string }[];
  deliveredTo?: { _id: string; name?: string }[];
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
   VIDEO CALL
================================ */
export type CallState = "idle" | "calling" | "incoming" | "active";

export interface IncomingCallInfo {
  callerId: string;
  callerInfo: { name: string; username: string; profilepic: string };
  offer: RTCSessionDescriptionInit;
  callType: "video" | "audio";
}

/* ================================
   MESSAGE RECEIPT STATUS
================================ */
export type MessageStatus = "sending" | "sent" | "delivered" | "read";

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

  // Online users
  onlineUsers: Set<string>;

  // Typing
  typingUsers: Record<string, boolean>; // conversationId → isTyping

  // Core Actions
  setSelectedChat: (chat: Chat | null) => void;
  accessChat: (userId: string) => Promise<void>;
  fetchChats: () => Promise<void>;
  sendMessage: (content: string) => void;
  sendMessageToConversation: (conversationId: string, content: string) => void;

  // Delete
  deleteMessage: (messageId: string) => void;
  deleteChat: (chatId: string) => Promise<void>;

  // Search
  searchResult: User[];
  setSearchResult: (users: User[]) => void;

  // Typing
  startTyping: () => void;
  stopTyping: () => void;

  // Loading
  loadingChat: boolean;

  // Utilities
  clearMessages: () => void;
  getMessageStatus: (msg: Message) => MessageStatus;

  // Block / Unblock
  blockedUsers: string[];
  blockUser: (userId: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  isBlocked: (userId: string) => boolean;
  fetchBlockedUsers: () => Promise<void>;

  // Video Call
  callState: CallState;
  callType: "video" | "audio";
  incomingCall: IncomingCallInfo | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  initiateCall: (targetUserId: string, targetInfo: { name: string; username: string; profilepic: string }, type?: "video" | "audio") => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;

  // Screen Share
  isScreenSharing: boolean;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => void;

  // Group Chat
  createGroup: (name: string, memberIds: string[]) => Promise<void>;
  leaveGroup: (chatId: string) => Promise<void>;
};

const ChatContext = createContext<ChatContextProps | null>(null);

export default ChatContext;