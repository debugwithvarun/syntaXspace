import { MoreVertical, Search, SquarePen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { ContactItem } from "./ContactItem";

export const ChatSidebar = ({ contacts, selectedContactId, onSelectContact }) => (
  // ADDED: overflow-hidden to the main wrapper to prevent it from stretching
  <div className="flex flex-col h-full bg-background overflow-hidden">
    
    {/* Header - Fixed height, won't shrink */}
    <div className="p-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src="https://github.com/evilrabbit.png" alt="Current User" />
          <AvatarFallback>ME</AvatarFallback>
        </Avatar>
        <span className="font-semibold text-lg tracking-tight">Chats</span>
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <SquarePen className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>  
    
    {/* Search Bar - Fixed height, won't shrink */}
    <div className="px-4 pb-4 shrink-0">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search or start a new chat" 
          className="pl-9 bg-muted/50 border-transparent hover:border-border focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-9" 
        />
      </div>
    </div>

    {/* ScrollArea - Takes remaining space, min-h-0 forces it to scroll its content */}
    <ScrollArea className="flex-1 w-full min-h-0">
      <div className="flex flex-col gap-0.5 px-2 pb-4">
        {contacts.map((contact) => (
          <ContactItem 
            key={contact.id} 
            contact={contact} 
            isActive={contact.id === selectedContactId}
            onClick={() => onSelectContact(contact.id)}
          />
        ))}
      </div>
    </ScrollArea>
  </div>
)