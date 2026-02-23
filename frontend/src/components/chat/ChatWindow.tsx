import { Check, CheckCheck, Info, Send, Smile, Video } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Separator } from "../ui/separator"
import { ScrollArea } from "../ui/scroll-area"
import { MOCK_MESSAGES } from "@/Pages/ChatDashbaord"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Input } from "../ui/input"

export const ChatWindow = ({ contact }) => {
  if (!contact) return (
    <div className="flex-1 flex flex-col items-center justify-center bg-muted/10 h-full">
      <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Send className="h-8 w-8 text-muted-foreground ml-1" />
      </div>
      <h3 className="text-xl font-semibold text-foreground">Your Messages</h3>
      <p className="text-muted-foreground mt-2">Select a chat or start a new conversation</p>
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">

      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10 border shadow-sm">
              <AvatarImage src={contact.avatar} alt={contact.name} />
              <AvatarFallback>{contact.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            {contact.online && (
              <span className="absolute bottom-0 right-0 w-3 h-3 border-2 border-background rounded-full bg-green-500 z-10" />
            )}
          </div>
          <div className="flex flex-col">
            <h2 className="font-semibold text-sm leading-tight">{contact.name}</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5 flex items-center gap-1">
              {contact.isTyping ? (
                <span className="text-primary font-medium animate-pulse">typing...</span>
              ) : contact.online ? (
                "Online"
              ) : (
                "Last seen recently"
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
            <Video className="h-5 w-5" />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-1" />
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Info className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 bg-muted/10 min-h-0 w-full">
        <div className="flex flex-col gap-4 max-w-3xl mx-auto w-full p-4 pb-4">
          {MOCK_MESSAGES.map((msg, idx) => {
            if (msg.type === "date") {
              return (
                <div key={idx} className="flex justify-center my-4">
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full border shadow-sm">
                    {msg.text}
                  </span>
                </div>
              )
            }

            if (msg.type === "unread_divider") {
              return (
                <div key={idx} className="flex items-center gap-4 my-2">
                  <div className="flex-1 h-[1px] bg-primary/20"></div>
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    Unread Messages
                  </span>
                  <div className="flex-1 h-[1px] bg-primary/20"></div>
                </div>
              )
            }

            const isMe = msg.sender === "me"
            
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div 
                  className={`relative max-w-[75%] px-4 py-2.5 rounded-2xl text-[15px] shadow-sm ${
                    isMe 
                      ? "bg-primary text-primary-foreground rounded-br-sm" 
                      : "bg-background border rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>
                <div className={`flex items-center gap-1 mt-1 mx-1 text-[11px] text-muted-foreground ${isMe ? "justify-end" : "justify-start"}`}>
                  <span>{msg.time}</span>
                  {isMe && (
                    <span className="ml-0.5">
                      {msg.status === "read" ? (
                        <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>


      <div className="p-3 bg-background border-t shrink-0">
        <div className="flex items-end gap-2 max-w-3xl mx-auto w-full bg-muted/40 p-1.5 pl-3 rounded-[24px] border shadow-sm transition-colors focus-within:border-primary/50 focus-within:bg-background">
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground rounded-full hover:bg-muted mb-0.5">
                <Smile className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="top" align="start" className="w-80 p-0 border-none shadow-xl bg-transparent mb-2">
              <div className="bg-background border rounded-xl shadow-lg p-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                <Smile className="h-8 w-8 text-muted-foreground/50" />
                <p>Emoji Picker Goes Here</p>
                <p className="text-xs">Install <code className="bg-muted px-1 py-0.5 rounded">emoji-picker-react</code> and drop it in this PopoverContent component.</p>
              </div>
            </PopoverContent>
          </Popover>

          <Input 
            placeholder="Type a message..." 
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2 shadow-none min-h-[40px] h-[40px] text-[15px]" 
          />
          
          <Button size="icon" className="h-10 w-10 rounded-full shrink-0 shadow-sm transition-transform active:scale-95">
            <Send className="h-4 w-4 ml-0.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}