import { Card } from "@/components/ui/card"
import { useIdle } from "@/hooks/useIdle"
import { Heart, MessageCircle } from "lucide-react"
import React, { useState } from "react"
import type { PostSummary } from "./PostSection"
import { useAuth } from "@/hooks/useAuth"
import { handleLikeClick } from "@/lib/LikeFunction"
import { handleCommentClick } from "@/lib/CommentFunction"



const PostCard: React.FC<PostSummary> = ({
  _id,
  title,
  description,
  likes_count,
  likes,
  comment,
  commentCount,
  timeLabel = "Just now",
}) => {

  const { setOpenView, setId } = useIdle()
  const {username}=useAuth()

  const [liked, setLiked] = useState(likes);
  const [likeCount, setLikeCount] = useState(likes_count);
  const [isliked, setIsLiked] = useState(likes.includes(username));



  const handleOpenView = async() => {
    setId(_id)
    setOpenView(true)
  }



  return (
    <Card
      className="cursor-pointer rounded-xl border border-border/60 p-5 sm:p-6 shadow-sm transition-shadow hover:shadow-md"
      onClick={handleOpenView}
    >
      <div>
        <h3 className="text-base font-semibold tracking-tight text-primary sm:text-lg">
          {title}
        </h3>
      </div>


      <div className="mt-1 sm:mt-2">
        <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <div
        className="mt-3 flex items-center justify-between border-t border-border/60 pt-3"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        {/* Left: likes + comments */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={(e) => handleLikeClick({e,_id,setIsLiked,setLikeCount,setLiked})}
            className={[
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs sm:text-[13px]",
              "transition-colors",
              isliked
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/70",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <Heart
              className="h-4 w-4 transition-transform"
              fill={isliked ? "currentColor" : "none"}
            />
            <span>{likeCount}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {handleCommentClick({e})}}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/70 sm:text-[13px]"
          >
            <MessageCircle className="h-4 w-4" />
            <span>
              {commentCount} {commentCount === 1 ? "Comment" : "Comments"}
            </span>
          </button>
        </div>

        <p className="text-xs text-muted-foreground">{timeLabel}</p>
      </div>
    </Card>
  )
}

export default PostCard
