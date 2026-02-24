import { MoreVertical, Search, SquarePen, Trash2 } from "lucide-react";
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
    deleteChat,
  } = useChat();

const [searchTerm, setSearchTerm] = useState("");

  /* ============================
     SEARCH USERS
  ============================ */
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResult([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/chat/users?search=${searchTerm}`,
          { credentials: "include" }
        );

        if (!res.ok) return;

        const data = await res.json();
        setSearchResult(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Search error:", err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, setSearchResult]);

  /* ============================
     SORT CHATS BY LATEST
  ============================ */
  const sortedChats = useMemo(() => {
    return [...chats].sort((a, b) => {
      const dateA = a.latestMessage?.createdAt || a.updatedAt;
      const dateB = b.latestMessage?.createdAt || b.updatedAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  }, [chats]);

  /* ============================
     GET OTHER PARTICIPANT
  ============================ */
  const getOtherUser = (participants: User[]) => {
    if (!participants || participants.length === 0) return null;

    return participants.find((p) => p._id !== myId) || participants[0];
  };

  const handleSearchSelect = (userId: string) => {
    accessChat(userId);
    setSearchTerm("");
    setSearchResult([]);
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">

      {/* Header */}
      <div className="p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={profilepic} alt="Current User" />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          <span className="font-semibold text-lg tracking-tight">
            Chats
          </span>
        </div>

        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <SquarePen className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pb-4 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search or start a new chat"
            className="pl-9 rounded-xl h-9"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1 w-full min-h-0">
        <div className="flex flex-col gap-1 px-2 pb-4">

          {/* SEARCH RESULTS */}
          {searchTerm && searchResult.length > 0 && (
            <>
              <p className="px-3 text-xs text-muted-foreground font-semibold mb-2">
                Search Results
              </p>

              {searchResult.map((user) => (
                <ContactItem
                  key={user._id}
                  name={user.name}
                  avatar={user.profilepic}
                  subtitle={"@" + user.username}
                  isActive={false}
                  onClick={() => handleSearchSelect(user._id)}
                />
              ))}
            </>
          )}

          {/* EXISTING CHATS */}
          {!searchTerm &&
            sortedChats.map((chat) => {
              const otherUser = getOtherUser(chat.participants);
              if (!otherUser) return null;

              return (
                <div key={chat._id} className="relative group">
                  <ContactItem
                    name={otherUser.name}
                    avatar={otherUser.profilepic}
                    subtitle={chat.latestMessage?.content || ""}
                    time={
                      chat.latestMessage
                        ? new Date(
                          chat.latestMessage.createdAt
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        : ""
                    }
                    isActive={selectedChat?._id === chat._id}
                    onClick={() => setSelectedChat(chat)}
                  />

                  {/* Delete Chat Button */}
                  <button
                    onClick={() => deleteChat(chat._id)}
                    className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
        </div>
      </ScrollArea>
    </div>
  );
};