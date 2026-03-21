import { MoreVertical, Search, SquarePen, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { ContactItem } from "./ContactItem";
import { useAuth } from "@/hooks/useAuth";
import { getInitials } from "@/lib/GetInitials";
import { useEffect, useState, useMemo } from "react";
import useChat from "@/hooks/useChat";
import { type User } from "@/context/chat/ChatContext";
import ImagePath from "@/lib/ImagePath";

const BACKEND_URL = "http://localhost:8000";

export const ChatSidebar = () => {
  const { profilepic, name, _id: myId } = useAuth();

  const {
    chats,
    selectedChat,
    setSelectedChat,
    accessChat,
    searchResult,
    setSearchResult,
    isBlocked,
    setOpenChat,
    onlineUsers,
  } = useChat();

  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);

  /* ─── SEARCH ─── */
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResult([]);
      return;
    }

    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/chat/users?search=${encodeURIComponent(searchTerm)}`,
          { credentials: "include" }
        );
        if (!res.ok) { setSearching(false); return; }
        const data: User[] = await res.json();
        const filtered = Array.isArray(data) ? data.filter((u) => !isBlocked(u._id)) : [];
        setSearchResult(filtered);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  /* ─── SORTED CHATS ─── */
  const sortedChats = useMemo(() => {
    return [...chats].sort((a, b) => {
      const da = a.latestMessage?.createdAt || a.updatedAt;
      const db = b.latestMessage?.createdAt || b.updatedAt;
      return new Date(db).getTime() - new Date(da).getTime();
    });
  }, [chats]);

  const getOtherUser = (participants: User[]) =>
    participants?.find((p) => p._id !== myId) || participants?.[0] || null;

  const handleSearchSelect = (userId: string) => {
    accessChat(userId);
    setSearchTerm("");
    setSearchResult([]);
  };

  const totalUnread = useMemo(() => {
    return chats.reduce((acc, chat) => {
      const count = chat.unreadCounts?.[myId || ""] || 0;
      return acc + count;
    }, 0);
  }, [chats, myId]);

  return (
    <div className="flex flex-col h-full bg-background">

      {/* ─── HEADER ─── */}
      <div className="px-4 py-3 border-b shrink-0 bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                <AvatarImage src={ImagePath(profilepic || "")} alt={name} />
                <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 h-2 w-2 bg-green-500 rounded-full border-2 border-background" />
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight">Messages</p>
              <p className="text-[10px] text-muted-foreground">
                {sortedChats.length} chats
                {totalUnread > 0 && ` · ${totalUnread} unread`}
              </p>
            </div>
          </div>

          <div className="flex gap-1">
            <Button
              variant="ghost" size="icon"
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary"
              title="New chat"
            >
              <SquarePen className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost" size="icon"
              className="h-8 w-8 rounded-full text-muted-foreground"
              onClick={() => setOpenChat(false)}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search people…"
            className="pl-9 pr-8 h-9 rounded-xl text-sm bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30"
          />
          {searchTerm && (
            <button
              onClick={() => { setSearchTerm(""); setSearchResult([]); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ─── LIST ─── */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col gap-0.5 p-2 pb-4">

          {/* SEARCH RESULTS */}
          {searchTerm ? (
            <>
              <p className="px-3 pt-1.5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                People
              </p>

              {searching ? (
                <div className="flex justify-center py-6">
                  <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : searchResult.length > 0 ? (
                searchResult.map((user) => (
                  <ContactItem
                    key={user._id}
                    name={user.name}
                    avatar={ImagePath(user.profilepic || "")}
                    subtitle={"@" + user.username}
                    isActive={false}
                    isOnline={onlineUsers.has(user._id)}
                    onClick={() => handleSearchSelect(user._id)}
                  />
                ))
              ) : (
                <p className="text-center text-xs text-muted-foreground py-6">
                  No users found for "{searchTerm}"
                </p>
              )}
            </>
          ) : (
            /* CHAT LIST */
            sortedChats.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground py-12">
                <SquarePen className="h-7 w-7 mx-auto mb-3 opacity-25" />
                No conversations yet.<br />Search to start chatting!
              </div>
            ) : (
              sortedChats.map((chat) => {
                const other = getOtherUser(chat.participants);
                if (!other) return null;
                const isActive = selectedChat?._id === chat._id;
                const unreadCount = chat.unreadCounts?.[myId || ""] || 0;
                const isOnline = onlineUsers.has(other._id);

                return (
                  <ContactItem
                    key={chat._id}
                    name={other.name}
                    avatar={ImagePath(other.profilepic || "")}
                    subtitle={
                      chat.latestMessage?.isDeleted
                        ? "Message deleted"
                        : chat.latestMessage?.content || "Start a conversation"
                    }
                    isDeletedMessage={chat.latestMessage?.isDeleted}
                    time={
                      chat.latestMessage
                        ? new Date(chat.latestMessage.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""
                    }
                    isActive={isActive}
                    isOnline={isOnline}
                    unreadCount={unreadCount}
                    onClick={() => setSelectedChat(chat)}
                  />
                );
              })
            )
          )}
        </div>
      </ScrollArea>
    </div>
  );
};