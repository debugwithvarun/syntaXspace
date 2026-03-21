import { useState } from "react";
import { BellIcon, Check, Trash2, UserCheck, UserPlus, MessageSquare, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/useNotifications";
import { type Notification } from "@/context/Notification/NotificationContext";
import useChat from "@/hooks/useChat";
import ImagePath from "@/lib/ImagePath";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const notifIcon = (type: Notification["type"]) => {
  switch (type) {
    case "follow_request": return <UserPlus className="h-3 w-3" />;
    case "follow_accepted": return <UserCheck className="h-3 w-3" />;
    case "new_message": return <MessageSquare className="h-3 w-3" />;
    case "post_like": return <Heart className="h-3 w-3" />;
    case "post_comment": return <MessageCircle className="h-3 w-3" />;
  }
};

const notifIconBg = (type: Notification["type"]) => {
  switch (type) {
    case "follow_request": return "bg-blue-500";
    case "follow_accepted": return "bg-green-500";
    case "new_message": return "bg-primary";
    case "post_like": return "bg-rose-500";
    case "post_comment": return "bg-amber-500";
  }
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
};

export default function NotificationMenu() {
  const { notifications, unreadCount, loading, markAllRead, markRead, removeNotification } =
    useNotifications();
  const { accessChat, setOpenChat } = useChat();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleClick = async (n: Notification) => {
    if (!n.read) await markRead(n._id);
    setOpen(false);

    if (n.type === "new_message" && n.sender?._id) {
      // Open the exact conversation with this sender
      await accessChat(n.sender._id);
      setOpenChat(true);
    } else if (n.link) {
      navigate(n.link);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="relative size-8 rounded-full text-muted-foreground shadow-none hover:text-primary"
          aria-label="Notifications"
        >
          <BellIcon size={16} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[360px] p-0 shadow-xl rounded-xl z-[410]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <BellIcon className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <span className="h-5 px-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold flex items-center">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1"
            >
              <Check className="h-3 w-3" />
              Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <ScrollArea className="max-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
              <BellIcon className="h-8 w-8 opacity-20" />
              <p className="text-sm">All caught up!</p>
              <p className="text-xs opacity-70">No new notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors group relative cursor-pointer",
                    !n.read && "bg-primary/5"
                  )}
                  onClick={() => handleClick(n)}
                >
                  {/* Avatar + type badge */}
                  <div className="relative shrink-0">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback
                        className="text-xs font-semibold bg-primary/10 text-primary"
                      >
                        {n.sender?.name?.[0] || "?"}
                      </AvatarFallback>
                      {n.sender?.profilepic && (
                        <AvatarFallback>
                          <img
                            src={ImagePath(n.sender.profilepic)}
                            alt={n.sender.name}
                            className="h-full w-full object-cover rounded-full"
                          />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full flex items-center justify-center text-white",
                        notifIconBg(n.type)
                      )}
                    >
                      {notifIcon(n.type)}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">
                      <span className="font-semibold">{n.sender?.name}</span>{" "}
                      <span className="text-muted-foreground">{n.message.replace(n.sender?.name || "", "").trim()}</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>

                  {/* Unread dot + delete */}
                  <div className="flex flex-col items-center gap-2">
                    {!n.read && (
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(n._id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
