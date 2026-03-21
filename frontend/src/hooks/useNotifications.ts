import { useContext } from "react";
import NotificationContext from "@/context/Notification/NotificationContext";

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationProvider");
  return ctx;
};
