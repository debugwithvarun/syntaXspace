import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

interface ContactItemProps {
  name: string;
  avatar?: string;
  subtitle?: string;
  time?: string;
  isActive: boolean;
  onClick: () => void;

  // NEW FEATURES
  unreadCount?: number;
  isOnline?: boolean;
  isDeletedMessage?: boolean;
  prefix?: string; // e.g. "You:"
  onRightAction?: () => void; // optional menu action
  isGroup?: boolean; // group chat indicator
}

export const ContactItem = ({
  name,
  avatar,
  subtitle,
  time,
  isActive,
  onClick,
  unreadCount,
  isOnline,
  isDeletedMessage,
  prefix,
  onRightAction,
  isGroup,
}: ContactItemProps) => {
  const initials =
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "U";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left group relative",
        isActive
          ? "bg-primary/10"
          : "hover:bg-muted/60"
      )}
    >
      {/* Avatar */}
      <div className="relative mt-0.5">
        <Avatar className="h-11 w-11 border border-background shadow-sm">
          {isGroup ? (
            <AvatarFallback className="bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </AvatarFallback>
          ) : (
            <>
              <AvatarImage src={avatar || ""} alt={name} />
              <AvatarFallback className="bg-muted text-muted-foreground font-medium">
                {initials}
              </AvatarFallback>
            </>
          )}
        </Avatar>

        {/* Online Indicator — only for 1:1 chats */}
        {!isGroup && isOnline && (
          <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={cn(
                "font-medium text-sm truncate",
                isActive ? "text-primary" : "text-foreground"
              )}
            >
              {name}
            </span>
            {isGroup && (
              <span className="shrink-0 text-[9px] font-semibold bg-primary/10 text-primary rounded-full px-1.5 py-0.5 leading-none">
                GROUP
              </span>
            )}
          </div>

          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
            {time}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span
            className={cn(
              "text-sm truncate pr-2 ",
              isDeletedMessage
                ? "italic text-muted-foreground"
                : "text-muted-foreground"
            )}
          >
            {prefix && <span className="font-medium mr-1">{prefix}</span>}
            {isDeletedMessage ? "Message deleted" : subtitle}
          </span>

          {/* Unread Badge */}
          {unreadCount && unreadCount > 0 && (
            <span className="ml-2 min-w-[20px] h-5 px-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-full flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Optional Right Action (like 3-dot menu) */}
      {onRightAction && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRightAction();
          }}
          className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-foreground"
        >
          •••
        </button>
      )}
    </button>
  );
};