import React, {  useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { EllipsisVertical, Heart,  MessageCircle } from "lucide-react"

import { useIdle } from "@/hooks/useIdle"
import { useAuth } from "@/hooks/useAuth"

import { handleLikeClick } from "@/lib/LikeFunction"
import { handleCommentClick } from "@/lib/CommentFunction"
import CommentSection from "./CommentSection"
import type { PostSummary } from "../profile/LeftSection/Tabs/PostSection"
import MenuBarEditDelete from "./Menu"

const PostCard: React.FC<PostSummary> = ({
  _id,
  setIsDlt,
  title,
  description,
  likes_count,
  likes,

  commentCount,
  timeLabel = "Just now",
}) => {
  const { setOpenView, setId,setOpenEdit } = useIdle()
  const { username, name } = useAuth()

  const [liked, setLiked] = useState(likes)
  const [likeCount, setLikeCount] = useState(likes_count)
  const [isLiked, setIsLiked] = useState(liked.includes(username))
  const [showComment, setShowComment] = useState(false)
  const [comment, setComment] = useState([])
  const [isCmnt,setIsCmnt]=useState(false);
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(
          `/api/syntaxspace/get-comments/${_id}?username=${username}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
  
        const { data } = await res.json();
        setComment(data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };
  
    fetchComments();
  }, [_id,isCmnt,username]); // important dependencies
  

  const handleOpenView = () => {
    setId(_id)
    setOpenView(true)
  }

  const handleOpenEdit=()=>{
    setId(_id)
    setOpenEdit((prev)=>!prev)
  }

  const likeLabel = useMemo(() => {
    if (likeCount === 0) return "Like"
    if (!isLiked) return `${likeCount} like${likeCount > 1 ? "s" : ""}`
    if (likeCount === 1) return "You"
    const others = likeCount - 1
    return `You & ${others} other${others > 1 ? "s" : ""}`
  }, [isLiked, likeCount])

  return (
    <Card
      className="cursor-pointer rounded-xl border border-border/60 p-6 relative"
      onClick={handleOpenView}
    >
     <span className="absolute right-4 top-4" onClick={(e)=>e.stopPropagation()}> <MenuBarEditDelete
  projectName={username}
  handleOpenEdit={handleOpenEdit}
  onConfirmDelete={async () => {
    await fetch(`/api/syntaxspace/delete-post/${_id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setIsDlt(prev => !prev);
  }}
>
  <EllipsisVertical />
</MenuBarEditDelete ></span>
      {/* Title & description */}
      <div className="space-y-1">
        <h3 className="text-base font-semibold tracking-tight text-primary sm:text-lg line-clamp-2">
          {title}
        </h3>

        <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      {/* Footer: likes / comments / time */}
      <div
        className="mt-1 flex items-center justify-between border-t border-border/60 pt-2 "
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 sm:gap-3">

          <span
            onClick={(e) =>
              handleLikeClick({ e, _id, setIsLiked, setLikeCount, setLiked })
            }
            className={`
              inline-flex items-center gap-1.5 rounded-full px-1 py-1 text-xs 
              transition-colors cursor-pointer
             
            `}
          >
            <Heart
              className={`h-4 w-4 transition-transform group-hover:scale-110 ${isLiked ? "fill-primary text-primary" : "fill-none stroke-muted-foreground text-muted-foreground"
                }`}
            />
            <span className="font-medium">{likeLabel}</span>
          </span>

          {/* Comment toggle */}
          <span
            onClick={(e) => handleCommentClick({ e, setShowComment })}
            className="inline-flex items-center gap-1.5 rounded-full px-1 py-1 text-xs  text-muted-foreground transition-colors hover:bg-muted/70"
          >
            <MessageCircle className="h-4 w-4" />
            <span>
              {commentCount} Comment
            </span>
          </span>
        </div>

        <p className="text-xs text-muted-foreground">{timeLabel}</p>
      </div>

   
      {showComment && (
        <div
          className="rounded-xl px-3 animate-in slide-in-from-top-2"
          onClick={(e) => e.stopPropagation()}
        >
          <CommentSection
          setIsCmnt={setIsCmnt}
          isCmnt={isCmnt}
            username={username}
            name={name}
            postId={_id}
            comments={comment} // expects Comment[] from PostSummary
            onClose={() => setShowComment(false)}
          />
        </div>
      )}
    </Card>
  )
}

export default PostCard
