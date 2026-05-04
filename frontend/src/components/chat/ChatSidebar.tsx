import { MoreVertical, Search, SquarePen, Users, X, Plus, Check } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { apiFetch } from "@/lib/api";

export const ChatSidebar = () => {
  const { profilepic, name, _id, userId } = useAuth();
  const myId = _id || userId;

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
    createGroup,
  } = useChat();

  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);

  // Group chat creation state
  const [groupOpen, setGroupOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [groupSearchResult, setGroupSearchResult] = useState<User[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [groupSearching, setGroupSearching] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);

  /* ─── SEARCH ─── */
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResult([]);
      return;
    }

    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await apiFetch(
          `/chat/users?search=${encodeURIComponent(searchTerm)}`
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

  /* ─── GROUP MEMBER SEARCH ─── */
  useEffect(() => {
    if (!groupSearch.trim()) { setGroupSearchResult([]); return; }
    setGroupSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await apiFetch(`/chat/users?search=${encodeURIComponent(groupSearch)}`);
        if (!res.ok) { setGroupSearching(false); return; }
        const data: User[] = await res.json();
        setGroupSearchResult(Array.isArray(data) ? data : []);
      } catch { /* noop */ }
      finally { setGroupSearching(false); }
    }, 400);
    return () => clearTimeout(timer);
  }, [groupSearch]);

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

  const toggleMember = (user: User) => {
    setSelectedMembers((prev) =>
      prev.find((m) => m._id === user._id)
        ? prev.filter((m) => m._id !== user._id)
        : [...prev, user]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedMembers.length < 2) return;
    setCreatingGroup(true);
    try {
      await createGroup(groupName.trim(), selectedMembers.map((m) => m._id));
      setGroupOpen(false);
      setGroupName("");
      setGroupSearch("");
      setSelectedMembers([]);
    } finally {
      setCreatingGroup(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background/95">

      {/* ─── HEADER ─── */}
      <div className="px-4 py-3 border-b shrink-0 bg-background/85 backdrop-blur">
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
            {/* New Group Chat */}
            <Dialog open={groupOpen} onOpenChange={setGroupOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost" size="icon"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary"
                  title="New group chat"
                >
                  <Users className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Create Group Chat
                  </DialogTitle>
                </DialogHeader>

                {/* Group Name */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Group Name</label>
                    <Input
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="e.g. Project Team"
                      className="mt-1.5 h-9 text-sm"
                    />
                  </div>

                  {/* Member Search */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Add Members (min 2)</label>
                    <div className="relative mt-1.5">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                      <Input
                        value={groupSearch}
                        onChange={(e) => setGroupSearch(e.target.value)}
                        placeholder="Search people…"
                        className="pl-9 h-9 text-sm bg-muted/50 border-0 focus-visible:ring-1"
                      />
                    </div>
                  </div>

                  {/* Selected members chips */}
                  {selectedMembers.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMembers.map((m) => (
                        <div key={m._id} className="flex items-center gap-1 bg-primary/10 text-primary rounded-full px-2.5 py-1 text-xs font-medium">
                          <Avatar className="h-4 w-4">
                            <AvatarImage src={ImagePath(m.profilepic || "")} />
                            <AvatarFallback className="text-[8px]">{m.name[0]}</AvatarFallback>
                          </Avatar>
                          {m.name}
                          <button onClick={() => toggleMember(m)} className="ml-0.5 hover:text-destructive transition-colors">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Search results */}
                  {groupSearch && (
                    <ScrollArea className="max-h-40 rounded-lg border bg-muted/10">
                      <div className="p-1">
                        {groupSearching ? (
                          <div className="flex justify-center py-3">
                            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          </div>
                        ) : groupSearchResult.length > 0 ? (
                          groupSearchResult.map((user) => {
                            const selected = !!selectedMembers.find((m) => m._id === user._id);
                            return (
                              <button
                                key={user._id}
                                onClick={() => toggleMember(user)}
                                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-muted transition-colors text-left"
                              >
                                <Avatar className="h-7 w-7 shrink-0">
                                  <AvatarImage src={ImagePath(user.profilepic || "")} />
                                  <AvatarFallback className="text-[10px]">{user.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">{user.name}</p>
                                  <p className="text-[10px] text-muted-foreground">@{user.username}</p>
                                </div>
                                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${selected ? "bg-primary border-primary" : "border-muted-foreground/40"}`}>
                                  {selected && <Check className="h-3 w-3 text-white" />}
                                </div>
                              </button>
                            );
                          })
                        ) : (
                          <p className="text-center text-xs text-muted-foreground py-3">No users found</p>
                        )}
                      </div>
                    </ScrollArea>
                  )}

                  <Button
                    onClick={handleCreateGroup}
                    disabled={!groupName.trim() || selectedMembers.length < 2 || creatingGroup}
                    className="w-full h-9"
                  >
                    {creatingGroup ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Create Group
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* New direct chat */}
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
            className="pl-9 pr-8 h-9 rounded-xl text-sm bg-muted/30 border border-border/50 focus-visible:ring-1 focus-visible:ring-primary/30"
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
                const isGroup = chat.isGroupChat;
                const other = isGroup ? null : getOtherUser(chat.participants);

                // For group chats: display group name and member count
                const displayName = isGroup
                  ? (chat.chatName || "Group Chat")
                  : (other?.name || "Unknown");

                const displayAvatar = isGroup ? "" : ImagePath(other?.profilepic || "");
                const displaySubtitle = isGroup
                  ? `${chat.participants.length} members`
                  : (chat.latestMessage?.isDeleted
                    ? "Message deleted"
                    : chat.latestMessage?.content || "Start a conversation");

                const isActive = selectedChat?._id === chat._id;
                const unreadCount = chat.unreadCounts?.[myId || ""] || 0;
                const isOnline = isGroup ? false : (other ? onlineUsers.has(other._id) : false);

                return (
                  <ContactItem
                    key={chat._id}
                    name={displayName}
                    avatar={displayAvatar}
                    subtitle={displaySubtitle}
                    isDeletedMessage={!isGroup && chat.latestMessage?.isDeleted}
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
                    isGroup={isGroup}
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