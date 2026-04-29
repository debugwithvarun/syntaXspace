import React, { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { EllipsisVertical, Heart, MessageCircle } from "lucide-react"

import { useIdle } from "@/hooks/useIdle"
import { useAuth } from "@/hooks/useAuth"

import { handleLikeClick } from "@/lib/LikeFunction"
import { handleCommentClick } from "@/lib/CommentFunction"
import { apiFetch } from "@/lib/api"
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
  username,
  timeLabel = "Just now",
  isError,
}) => {
  const { setOpenView, setId, setOpenEdit } = useIdle()
  const { name, username: Authuser } = useAuth()

  const [liked, setLiked] = useState(likes)
  const [likeCount, setLikeCount] = useState(likes_count)
  const [isLiked, setIsLiked] = useState(liked.includes(Authuser))
  const [showComment, setShowComment] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [comment, setComment] = useState<any[]>([])
  const [isCmnt, setIsCmnt] = useState(false)

  // Local animation states
  const [likePulse, setLikePulse] = useState(false)
  const [showPlus, setShowPlus] = useState(false)

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await apiFetch(
          `/syntaxspace/get-comments/${_id}?username=${username}`
        )
        const { data } = await res.json()
        setComment(data)
      } catch (error) {
        console.error("Error fetching comments:", error)
      }
    }
    fetchComments()
  }, [_id, isCmnt, username])

  useEffect(() => {
    if (likePulse) {
      const t = setTimeout(() => setLikePulse(false), 300)
      return () => clearTimeout(t)
    }
  }, [likePulse])

  useEffect(() => {
    if (showPlus) {
      const t = setTimeout(() => setShowPlus(false), 700)
      return () => clearTimeout(t)
    }
  }, [showPlus])

  const handleOpenView = () => {
    setId(_id)
    setOpenView(true)
  }

  const handleOpenEdit = () => {
    setId(_id)
    setOpenEdit(prev => !prev)
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
      className="cursor-pointer rounded-xl border border-border/60 p-0 relative overflow-hidden"
      onClick={handleOpenView}
    >
      {/* LEFT STRIP */}
      <div
        className={`w-1 absolute left-0 top-0 bottom-0 ${isError ? "bg-red-500" : "bg-primary"}`}
      />

      {/* MAIN CONTENT */}
      <div className="p-6">
        {/* EDIT/DELETE MENU */}
        {username === Authuser && (
          <span className="absolute right-4 top-4" onClick={(e) => e.stopPropagation()}>
            <MenuBarEditDelete
              projectName={username}
              handleOpenEdit={handleOpenEdit}
              onConfirmDelete={async () => {
                await apiFetch(`/syntaxspace/delete-post/${_id}`, {
                  method: "DELETE",
                })
                setIsDlt(prev => !prev)
              }}
            >
              <EllipsisVertical />
            </MenuBarEditDelete>
          </span>
        )}


        <div className="space-y-4">
          {/* Badge row */}
          <div className="flex items-center gap-2">
            {isError ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                <svg width="9" height="9" viewBox="0 0 24 24"><path fill="currentColor" d="M11.001 2h2v12h-2zM11 18h2v2h-2z"/></svg>
                Error
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                <svg width="9" height="9" viewBox="0 0 24 24"><path fill="currentColor" d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>
                Working
              </span>
            )}
          </div>

          <h3 className="text-base font-semibold tracking-tight text-primary sm:text-lg line-clamp-2">
            {title}
          </h3>

          <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground w-[95%]">
            {description}
          </p>
        </div>

        <div
          className="mt-3 flex items-center justify-between pt-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 sm:gap-3">

            <span
              className="relative inline-flex items-center gap-1.5 rounded-full px-1 py-1 text-xs transition-colors cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                const willLike = !isLiked
         
                handleLikeClick({ e, _id, setIsLiked, setLikeCount, setLiked })

        
                setLikePulse(true)
                if (willLike) {
                  setShowPlus(true)
                }
              }}
            >
              <Heart
                className={`h-4 w-4 transition-transform ${isLiked ? "fill-primary text-primary" : "fill-none stroke-muted-foreground text-muted-foreground"}`}
                style={{ transform: likePulse ? "scale(1.22)" : undefined }}
              />

       
              <span
                className={`font-medium transition-transform ${likePulse ? "scale-110" : "scale-100"} ${isLiked ? "text-primary" : "text-muted-foreground"}`}
              >
                {likeLabel}
              </span>

     
              {showPlus && (
                <span
                  className="absolute -right-3 -top-5 text-xs font-semibold text-primary"
                  style={{
                    transform: "translateY(0)",
                    animation: "likeFloat 700ms ease-out forwards",
                    
                  }}
                >
                  +1
                </span>
              )}
            </span>

          
            <span
              onClick={(e) => handleCommentClick({ e, setShowComment })}
              className="inline-flex items-center gap-1.5 rounded-full px-1 py-1 text-xs text-muted-foreground "
            >
              <MessageCircle className="h-4 w-4" />
              <span>{comment.length} Comment{comment.length >= 1 ? "s" : ""}</span>
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
      </div>

      <style>{`
        @keyframes likeFloat {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          60% { transform: translateY(-18px) scale(1.05); opacity: 0.9; }
          100% { transform: translateY(-32px) scale(0.95); opacity: 0; }
        }
      `}</style>
    </Card>
  )
}

export default PostCard
