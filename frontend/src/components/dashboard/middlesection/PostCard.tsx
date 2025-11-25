import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useIdle } from "@/hooks/useIdle";
import { Heart, MessageCircle } from "lucide-react";


const PostCard = () => {
  const {setOpenView}=useIdle()
  return (
    <Card className="p-5 sm:p-6 rounded-xl border border-border/60  shadow-sm hover:shadow-md transition-shadow">
      
      {/* Header: Avatar + name */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src="/origin/avatar-80-07.jpg" alt="Kelly King" />
            <AvatarFallback>KK</AvatarFallback>
          </Avatar>

          <div className="leading-tight">
            <h5 className="text-sm font-semibold">shaziya</h5>
            <p className="text-xs text-muted-foreground">@malikShazu</p>
          </div>
        </div>

        {/* Optional: language / tag pill */}
        <span className="hidden sm:inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground bg-muted/60">
          #python
        </span>
      </div>

      {/* Title */}
      <div className="mt-4">
        <h3 className="text-base sm:text-lg font-semibold tracking-tight">
          This is post title
        </h3>
      </div>

      {/* Description */}
      <div className="mt-2">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
          veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
          commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
          velit esse cillum dolore eu fugiat nulla pariatur.
        </p>
      </div>

      {/* View code link */}
   
        <Button
        variant={"ghost"}
        onClick={()=>setOpenView(true)}
          className="inline-flex items-start text-start w-fit text-xs font-medium text-primary "
        >
          View Code
        </Button>


      {/* Footer: likes, comments, time */}
      <div className=" pt-3 border-t border-border/60 flex items-center justify-between">
        {/* Left side: likes + comments */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs text-muted-foreground hover:bg-muted/70 transition"
          >
            <Heart className="w-4 h-4" />
            <span>24</span>
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs text-muted-foreground hover:bg-muted/70 transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>10 Comments</span>
          </button>
        </div>

        {/* Right side: time */}
        <p className="text-xs text-muted-foreground">
          2 hours ago
        </p>
      </div>
    </Card>
  );
};

export default PostCard;
