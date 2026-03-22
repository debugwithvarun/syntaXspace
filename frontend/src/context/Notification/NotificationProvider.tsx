import { useCallback, useEffect, useState } from "react";
import NotificationContext, { type Notification } from "./NotificationContext";
import { useChat } from "@/hooks/useChat";
import { apiFetch } from "@/lib/api";

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // Access the shared socket from ChatProvider
  const { socket } = useChat();

  const unreadCount = notifications.filter((n) => !n.read).length;

  /* =====================================================
     FETCH FROM API
  ===================================================== */
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error("Fetch notifications error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  /* =====================================================
     LISTEN FOR REAL-TIME SOCKET NOTIFICATIONS
  ===================================================== */
  useEffect(() => {
    if (!socket) return;

    const handleNew = (notification: Notification) => {
      setNotifications((prev) => {
        // Avoid duplicates
        if (prev.find((n) => n._id === notification._id)) return prev;
        return [notification, ...prev];
      });
    };

    socket.on("new-notification", handleNew);
    return () => {
      socket.off("new-notification", handleNew);
    };
  }, [socket]);

  /* =====================================================
     MARK ALL READ
  ===================================================== */
  const markAllRead = async () => {
    try {
      await apiFetch("/notifications/read-all", { method: "PUT" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  /* =====================================================
     MARK ONE READ
  ===================================================== */
  const markRead = async (id: string) => {
    try {
      await apiFetch(`/notifications/read/${id}`, { method: "PUT" });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  /* =====================================================
     REMOVE ONE
  ===================================================== */
  const removeNotification = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}`, { method: "DELETE" });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Remove notification error:", err);
    }
  };

  const addNotification = (n: Notification) => {
    setNotifications((prev) => [n, ...prev.filter((x) => x._id !== n._id)]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAllRead,
        markRead,
        removeNotification,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
