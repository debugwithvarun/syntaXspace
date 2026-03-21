import { createContext } from "react";

export interface NotificationUser {
  _id: string;
  name: string;
  username: string;
  profilepic: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  sender: NotificationUser;
  type: "follow_request" | "follow_accepted" | "new_message" | "post_like" | "post_comment";
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAllRead: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  addNotification: (n: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
export default NotificationContext;
