import {
  HoverCard,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

export default function ProfileTitle() {
    const {username,name}=useAuth()
   
  const splitName = name?.split(" ");
  const initials = splitName?.map((part:string) => part.charAt(0).toUpperCase()).join("");
  return (
    <HoverCard>
      <div className="flex items-center gap-3  ">
        <div className="w-[50px] aspect-square rounded-full text-2xl bg-secondary flex justify-center items-center">
            {initials}
        </div>
        <div className="space-y-0.5 ">
          <HoverCardTrigger asChild>
            <p>
              <Link className="text-sm font-medium hover:underline " to={`/profile/${username}`}>
                {name}
              </Link>
            </p>
          </HoverCardTrigger>
          <p className="text-xs text-muted-foreground w-full ">@{username}</p>
        </div>
      </div>
    
    </HoverCard>
  )
}
