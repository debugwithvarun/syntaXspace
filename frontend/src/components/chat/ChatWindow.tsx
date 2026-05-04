import {
  ArrowLeft,
  Ban,
  Check,
  CheckCheck,
  Info,
  LogOut,
  MoreVertical,
  Phone,
  Send,
  ShieldCheck,
  Smile,
  Trash2,
  Users,
  Video,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import useChat from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { type User, type Message } from "@/context/chat/ChatContext";
import ImagePath from "@/lib/ImagePath";
import { cn } from "@/lib/utils";

/* ── Read-receipt tick ─────────────────────────────── */
const MessageTicks = ({ status }: { status: string }) => {
  if (status === "sending") return <Check className="h-3 w-3 text-muted-foreground/50 animate-pulse" />;
  if (status === "sent")      return <Check className="h-3 w-3 text-muted-foreground" />;
  if (status === "delivered") return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
  if (status === "read")      return <CheckCheck className="h-3 w-3 text-blue-400" />;
  return null;
};

/* ── Format timestamp ──────────────────────────────── */
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
};

/* ── Group messages by day ──────────────────────────── */
const groupByDay = (msgs: Message[]) => {
  const groups: { date: string; messages: Message[] }[] = [];
  for (const msg of msgs) {
    const date = fmtDate(msg.createdAt);
    const last = groups[groups.length - 1];
    if (last?.date === date) {
      last.messages.push(msg);
    } else {
      groups.push({ date, messages: [msg] });
    }
  }
  return groups;
};

export const ChatWindow = () => {
  const {
    messages,
    sendMessage,
    selectedChat,
    deleteMessage,
    deleteChat,
    blockUser,
    unblockUser,
    isBlocked,
    initiateCall,
    callState,
    onlineUsers,
    typingUsers,
    startTyping,
    stopTyping,
    getMessageStatus,
    leaveGroup,
    setSelectedChat,
  } = useChat();

  const { _id, userId } = useAuth();
  const myId = _id || userId;
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isTypingRef = useRef(false);

  const messageGroups = useMemo(() => groupByDay(messages.filter((m) => !m.isDeleted)), [messages]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const isGroup = selectedChat?.isGroupChat ?? false;

  const otherUser: User | null = useMemo(() => {
    if (isGroup || !selectedChat?.participants?.length) return null;
    return selectedChat.participants.find((p) => p._id !== myId) || selectedChat.participants[0];
  }, [selectedChat, myId, isGroup]);

  const blocked = useMemo(() => (!isGroup && otherUser) ? isBlocked(otherUser._id) : false, [isBlocked, otherUser, isGroup]);
  const isOtherOnline = useMemo(() => (!isGroup && otherUser) ? onlineUsers.has(otherUser._id) : false, [onlineUsers, otherUser, isGroup]);
  const isOtherTyping = useMemo(
    () => selectedChat ? !!typingUsers[selectedChat._id] : false,
    [typingUsers, selectedChat]
  );

  // Group members count (excluding self)
  const groupMembersCount = isGroup ? (selectedChat?.participants?.length ?? 0) : 0;
  const groupOnlineCount = isGroup
    ? (selectedChat?.participants?.filter((p) => p._id !== myId && onlineUsers.has(p._id)).length ?? 0)
    : 0;

  const displayName = isGroup
    ? (selectedChat?.chatName || "Group Chat")
    : (otherUser?.name ?? "");

  const displayPic = isGroup ? "" : (otherUser?.profilepic ?? "");
  const displayInitial = isGroup
    ? null
    : (otherUser?.name?.[0]?.toUpperCase() ?? "?");

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!isTypingRef.current && e.target.value) {
      isTypingRef.current = true;
      startTyping();
    }
    if (!e.target.value) {
      isTypingRef.current = false;
      stopTyping();
    }
  };

  const handleSend = useCallback(() => {
    if (!inputText.trim() || !selectedChat || blocked) return;
    sendMessage(inputText.trim());
    setInputText("");
    isTypingRef.current = false;
    inputRef.current?.focus();
  }, [inputText, selectedChat, blocked, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVideoCall = () => {
    if (!otherUser || callState !== "idle" || isGroup) return;
    initiateCall(otherUser._id, {
      name: otherUser.name,
      username: otherUser.username,
      profilepic: otherUser.profilepic,
    });
  };

  const handleToggleBlock = async () => {
    if (!otherUser) return;
    if (blocked) await unblockUser(otherUser._id);
    else await blockUser(otherUser._id);
  };

  /* ─── EMPTY STATE ───────────────────────────────── */
  if (!selectedChat || (!isGroup && !otherUser)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full gap-4 select-none">
        <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center">
          <Send className="h-8 w-8 text-primary ml-1" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold">Your Messages</h3>
          <p className="text-sm text-muted-foreground mt-1">Select a conversation or start a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">

      {/* ═══════════════ HEADER ═══════════════ */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b shrink-0 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full md:hidden text-muted-foreground"
            onClick={() => setSelectedChat(null)}
            title="Back to chats"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="relative">
            {isGroup ? (
              <div className="h-10 w-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center shadow">
                <Users className="h-5 w-5 text-primary" />
              </div>
            ) : (
              <>
                <Avatar className="h-10 w-10 border-2 border-primary/10 shadow">
                  <AvatarImage src={ImagePath(displayPic)} alt={displayName} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                    {displayInitial}
                  </AvatarFallback>
                </Avatar>
                {isOtherOnline && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-background" />
                )}
              </>
            )}
          </div>

          <div>
            <p className="font-semibold text-sm leading-tight">{displayName}</p>
            {isGroup ? (
              <p className="text-[11px] text-muted-foreground">
                {groupMembersCount} members
                {groupOnlineCount > 0 && <span className="text-green-500 ml-1">· {groupOnlineCount} online</span>}
              </p>
            ) : isOtherTyping ? (
              <p className="text-[11px] text-primary font-medium flex items-center gap-1">
                <span className="inline-flex gap-0.5">
                  <span className="h-1 w-1 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                  <span className="h-1 w-1 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                  <span className="h-1 w-1 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                </span>
                typing…
              </p>
            ) : (
              <p className={cn("text-[11px] font-medium", isOtherOnline ? "text-green-500" : "text-muted-foreground")}>
                {isOtherOnline ? "Online" : "Offline"}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Audio call — only for 1:1 */}
          {!isGroup && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary"
              onClick={() => {
                if (!otherUser || callState !== "idle") return;
                initiateCall(
                  otherUser._id,
                  { name: otherUser.name, username: otherUser.username, profilepic: otherUser.profilepic },
                  "audio"
                );
              }}
              disabled={callState !== "idle" || blocked}
              title="Start voice call"
            >
              <Phone className="h-4 w-4" />
            </Button>
          )}

          {/* Video call — only for 1:1 */}
          {!isGroup && (
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 rounded-full", callState !== "idle" ? "text-destructive" : "text-muted-foreground hover:text-primary")}
              onClick={handleVideoCall}
              disabled={callState !== "idle" || blocked}
              title="Start video call"
            >
              <Video className="h-4 w-4" />
            </Button>
          )}

          <Separator orientation="vertical" className="h-5 mx-0.5" />

          {/* Options dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 z-50">
              {!isGroup && (
                <DropdownMenuItem>
                  <Info className="h-4 w-4 mr-2" /> View profile
                </DropdownMenuItem>
              )}
              {isGroup && (
                <DropdownMenuItem className="text-muted-foreground cursor-default" disabled>
                  <Users className="h-4 w-4 mr-2" />
                  {groupMembersCount} members
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />

              {/* Block/Unblock — only for 1:1 */}
              {!isGroup && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className={blocked ? "text-green-600" : "text-destructive focus:text-destructive"}
                    >
                      {blocked ? <><ShieldCheck className="h-4 w-4 mr-2" />Unblock</> : <><Ban className="h-4 w-4 mr-2" />Block</>}
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{blocked ? "Unblock" : "Block"} @{otherUser?.username}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {blocked ? "They'll be able to send you messages again." : "They won't be able to send you messages while blocked."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleToggleBlock}>Yes, {blocked ? "unblock" : "block"}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {/* Leave Group — only for group chats */}
              {isGroup && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="text-destructive focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4 mr-2" /> Leave group
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Leave "{selectedChat.chatName}"?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You will no longer receive messages from this group.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => leaveGroup(selectedChat._id)} className="bg-destructive hover:bg-destructive/90">
                        Yes, leave
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              <DropdownMenuSeparator />

              {/* Delete Chat */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" /> Delete chat
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
                    <AlertDialogDescription>This will permanently delete all messages. This cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteChat(selectedChat._id)}>Yes, delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ═══════════════ BLOCKED BANNER ═══════════════ */}
      {!isGroup && blocked && (
        <div className="px-3 py-2 text-xs text-center bg-destructive/5 text-destructive border-b flex items-center justify-center gap-1.5">
          <Ban className="h-3 w-3" />
          You have blocked this user. Unblock to message them.
        </div>
      )}

      {/* ═══════════════ MESSAGES ═══════════════ */}
      <ScrollArea className="flex-1 min-h-0 bg-background">
        <div className="flex flex-col gap-1 px-4 py-4 max-w-3xl mx-auto w-full">

          {messageGroups.length === 0 && (
            <p className="text-center text-xs text-muted-foreground mt-10">
              No messages yet — say hello! 👋
            </p>
          )}

          {messageGroups.map((group) => (
            <div key={group.date} className="flex flex-col gap-1">
              {/* Date separator */}
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-[10px] font-medium text-muted-foreground bg-background px-2 py-0.5 rounded-full border">
                  {group.date}
                </span>
                <div className="flex-1 h-px bg-border/50" />
              </div>

              {group.messages.map((msg, idx) => {
                const senderId =
                  typeof msg.sender === "string" ? msg.sender : (msg.sender as User)?._id;
                const senderObj = typeof msg.sender === "object" ? (msg.sender as User) : null;
                const isMe = senderId === myId;
                const status = getMessageStatus(msg);

                // Show avatar when sender changes
                const prevMsg = group.messages[idx - 1];
                const prevSenderId = prevMsg
                  ? typeof prevMsg.sender === "string"
                    ? prevMsg.sender
                    : (prevMsg.sender as User)?._id
                  : null;
                const showAvatar = !isMe && prevSenderId !== senderId;
                // Show sender name in group chats for received messages
                const showSenderName = isGroup && !isMe && showAvatar;

                return (
                  <div
                    key={msg._id}
                    className={cn(
                      "flex gap-2 group",
                      isMe ? "flex-row-reverse" : "flex-row",
                      showAvatar ? "mt-2" : "mt-0.5"
                    )}
                  >
                    {/* Avatar — only for received messages, when sender changes */}
                    <div className="w-7 shrink-0">
                      {!isMe && showAvatar && (
                        <Avatar className="h-7 w-7 border">
                          <AvatarImage src={ImagePath(senderObj?.profilepic || "")} />
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                            {senderObj?.name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>

                    <div className={cn("flex flex-col max-w-[70%]", isMe ? "items-end" : "items-start")}>
                      {/* Sender name for group chats */}
                      {showSenderName && (
                        <span className="text-[10px] font-semibold text-primary/80 mb-0.5 px-1">
                          {senderObj?.name || "Unknown"}
                        </span>
                      )}

                      <div
                        className={cn(
                          "relative group/msg px-3.5 py-2 rounded-2xl text-sm border select-text",
                          isMe
                            ? "bg-primary/90 text-primary-foreground border-primary/40 rounded-br-sm"
                            : "bg-muted/40 border-border/50 rounded-bl-sm"
                        )}
                      >
                        {msg.content}

                        {/* Delete hover button (my messages only) */}
                        {isMe && (
                          <button
                            onClick={() => deleteMessage(msg._id)}
                            className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover/msg:opacity-100 transition-opacity p-0.5"
                          >
                            <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                          </button>
                        )}
                      </div>

                      {/* Time + receipt */}
                      <div className={cn("flex items-center gap-1 mt-0.5 px-1", isMe ? "flex-row-reverse" : "flex-row")}>
                        <span className="text-[10px] text-muted-foreground">{fmtTime(msg.createdAt)}</span>
                        {isMe && <MessageTicks status={status} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* ═══════════════ INPUT ═══════════════ */}
      <div className="px-4 py-3 border-t shrink-0 bg-background/95">
        {!isGroup && blocked ? (
          <div className="text-sm text-muted-foreground text-center py-2 flex items-center justify-center gap-2">
            <Ban className="h-4 w-4" />
            Cannot message a blocked user
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-muted/25 border border-border/50 rounded-2xl px-3 py-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full shrink-0 text-muted-foreground hover:text-primary"
            >
              <Smile className="h-4 w-4" />
            </Button>

            <Input
              ref={inputRef}
              value={inputText}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onBlur={stopTyping}
              placeholder={isGroup ? `Message ${selectedChat.chatName || "group"}…` : "Message…"}
              className="flex-1 border-0 bg-transparent h-8 focus-visible:ring-0 focus-visible:ring-offset-0 px-1 text-sm placeholder:text-muted-foreground/60"
            />

            <Button
              onClick={handleSend}
              size="icon"
              className={cn(
                "h-8 w-8 rounded-full shrink-0 transition-all",
                inputText.trim()
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
              disabled={!inputText.trim()}
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};