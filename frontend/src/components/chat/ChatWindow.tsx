import {
  CheckCheck,
  Info,
  Send,
  Smile,
  Video,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Input } from "../ui/input";
import useChat from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { useState, useRef, useEffect, useMemo } from "react";
import { type User, type Message } from "@/context/chat/ChatContext";

export const ChatWindow = () => {
  const {
    messages,
    sendMessage,
    selectedChat,
    deleteMessage,
  } = useChat();

  const { _id: myId } = useAuth();
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  /* ============================
     AUTO SCROLL
  ============================ */
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  /* ============================
     GET OTHER USER
  ============================ */
  const otherUser: User | null = useMemo(() => {
    if (!selectedChat?.participants?.length) return null;

    return (
      selectedChat.participants.find((p) => p._id !== myId) ||
      selectedChat.participants[0]
    );
  }, [selectedChat, myId]);

  /* ============================
     SEND MESSAGE
  ============================ */
  const handleSend = () => {
    if (!inputText.trim() || !selectedChat) return;
    sendMessage(inputText.trim());
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  /* ============================
     EMPTY STATE
  ============================ */
  if (!selectedChat || !otherUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-muted/10 h-full">
        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Send className="h-8 w-8 text-muted-foreground ml-1" />
        </div>
        <h3 className="text-xl font-semibold">
          Your Messages
        </h3>
        <p className="text-muted-foreground mt-2">
          Select a chat or start a new conversation
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">

      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between p-4 border-b shrink-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border shadow-sm">
            <AvatarImage
              src={otherUser.profilepic}
              alt={otherUser.name}
            />
            <AvatarFallback>
              {otherUser.name?.[0]}
            </AvatarFallback>
          </Avatar>

          <div>
            <h2 className="font-semibold text-sm">
              {otherUser.name}
            </h2>
            <p className="text-xs text-muted-foreground">
              Online
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-1" />
          <Button variant="ghost" size="icon">
            <Info className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* ================= MESSAGES ================= */}
      <ScrollArea className="flex-1 min-h-0 bg-muted/10">
        <div className="flex flex-col gap-4 max-w-3xl mx-auto w-full p-4">

          {messages.map((msg: Message) => {
            if (msg.isDeleted) return null;

            const senderId =
              typeof msg.sender === "string"
                ? msg.sender
                : msg.sender?._id;

            const isMe = senderId === myId;

            const msgTime = new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={msg._id}
                className={`flex flex-col ${
                  isMe ? "items-end" : "items-start"
                } group`}
              >
                <div
                  className={`relative max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-background border rounded-bl-sm"
                  }`}
                >
                  {msg.content}

                  {isMe && (
                    <button
                      onClick={() => deleteMessage(msg._id)}
                      className="absolute -right-6 top-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                    </button>
                  )}
                </div>

                <div
                  className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${
                    isMe ? "justify-end" : "justify-start"
                  }`}
                >
                  <span>{msgTime}</span>
                  {isMe && (
                    <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
                  )}
                </div>
              </div>
            );
          })}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* ================= INPUT ================= */}
      <div className="p-3 border-t shrink-0">
        <div className="flex items-center gap-2 max-w-3xl mx-auto w-full bg-muted/40 p-2 rounded-full border">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <Smile className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="p-4 text-sm">
                Emoji Picker (Integrate later)
              </div>
            </PopoverContent>
          </Popover>

          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 border-0 bg-transparent focus-visible:ring-0"
          />

          <Button onClick={handleSend} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};