import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export const ContactItem = ({ contact, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left group ${
        isActive 
          ? "bg-primary/10 text-accent-foreground" 
          : "hover:bg-muted/60"
      }`}
    >
      <div className="relative mt-0.5">
        <Avatar className="h-11 w-11 border border-background shadow-sm">
          <AvatarImage src={contact.avatar} alt={contact.name} />
          <AvatarFallback className="bg-muted text-muted-foreground font-medium">
            {contact.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {contact.online && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-background rounded-full bg-green-500 z-10" />
        )}
      </div>
      
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center mb-0.5">
          <span className={`font-medium text-sm truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
            {contact.name}
          </span>
          <span className={`text-xs whitespace-nowrap ml-2 ${contact.unread > 0 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
            {contact.time}
          </span>
        </div>
        <div className="flex justify-between items-center h-5">
          {contact.isTyping ? (
            <span className="text-xs text-primary animate-pulse font-medium">Typing...</span>
          ) : (
            <span className="text-sm text-muted-foreground truncate pr-2">
              {contact.lastMessage}
            </span>
          )}
          
          {contact.unread > 0 && (
            <span className="flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-[10px] font-bold text-primary-foreground bg-primary rounded-full shadow-sm">
              {contact.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  )