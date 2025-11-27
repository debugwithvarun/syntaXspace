import React, { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import {  Heart, MessageCircle } from "lucide-react"

import { useIdle } from "@/hooks/useIdle"
import { useAuth } from "@/hooks/useAuth"

import { handleLikeClick } from "@/lib/LikeFunction"
import { handleCommentClick } from "@/lib/CommentFunction"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import CommentSection from "@/components/postCard/CommentSection"
import type { PostSummary } from "./MiddleSection"
import ImagePath from "@/lib/ImagePath"
import { Link } from "react-router-dom"



const PostCard: React.FC<PostSummary> = ({
  _id,
  title,
  description,
  likes_count,
  likes,
  owner, 
   profilepic,
  username,
  commentCount,
  timeLabel = "Just now",
  language
}) => {
  const { setOpenView, setId, } = useIdle()
  const { name, username: Authuser } = useAuth()

  const [liked, setLiked] = useState(likes)
  const [likeCount, setLikeCount] = useState(likes_count)
  const [isLiked, setIsLiked] = useState(liked.includes(Authuser))
  const [showComment, setShowComment] = useState(false)
  const [comment, setComment] = useState([])
  const [isCmnt, setIsCmnt] = useState(false);

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
  }, [_id, isCmnt, username]); // important dependencies


  const handleOpenView = () => {
    setId(_id)
    setOpenView(true)
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
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={ImagePath(profilepic)} alt="Kelly King" />
            <AvatarFallback>{owner.split(" ").map(n => n[0]).join("")}</AvatarFallback>
          </Avatar>

          <div className="leading-tight">
            <Link to={`/community/${username}`} onClick={(e)=>e.stopPropagation()}>
            <h5 className="text-sm font-semibold">{owner}</h5>
            <p className="text-xs text-muted-foreground">@{username}</p>
            </Link>
          </div>
        </div>

        {/* Optional: language / tag pill */}
        <span className="hidden sm:inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground bg-muted/60">
          #{language}
        </span>
      </div>
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
            comments={comment} 
            onClose={() => setShowComment(false)}
          />
        </div>
      )}
    </Card>
  )
}

export default PostCard
