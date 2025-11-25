"use client"

import React, { useMemo, useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, MessageCircle, Send } from "lucide-react"
import {
  handleCommentLike,
  handleToggleReply,
  handleReplyLike,
  handleSubmitComment,
  handleSubmitReply,
} from "@/lib/CommentFunction"

interface Reply {
  _id: string
  username: string
  avatar?: string
  content: string
  timeLabel: string
  likes: number
  isLiked: boolean
}

interface Comment {
  _id: string
  username: string
  avatar?: string
  content: string
  timeLabel: string
  likes: number
  isLiked: boolean
  replies?: Reply[]
}

interface CommentSectionProps {
  postId: string
  comments?: Comment[]
  onClose?: () => void
}

// Helper: safe initials generator
const getInitials = (username: string): string => {
  const clean = username.replace(/[_\s]+/g, " ").trim()

  if (!clean) return "U"

  const parts = clean.split(" ").filter(Boolean)
  const first = parts[0]?.[0] ?? ""
  const second = parts[1]?.[0] ?? ""

  const initials = (first + second || first || "U").toUpperCase()
  return initials.slice(0, 2)
}

const CommentSection: React.FC<CommentSectionProps> = ({
  comments = [],
 
}) => {
  const [newComment, setNewComment] = useState("")
  const [localComments, setLocalComments] = useState<Comment[]>(comments)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")

  const hasComments = useMemo(() => localComments.length > 0, [localComments])

  return (
    <div className="backdrop-blur-sm space-y-3">
      


      <div className="space-y-2">
        {/* Add Comment Form */}
        <div className="flex gap-3 pb-2 border-b border-border/40">
          <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
            <AvatarImage src="" alt="You" />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xs sm:text-sm font-semibold">
              YU
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-1 items-center gap-2">
            <Input
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="text-sm border-border/60 focus-visible:ring-primary/20"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmitComment({
                    newComment,
                    setNewComment,
                    setLocalComments,
                  })
                }
              }}
            />
            <Button
              size="sm"
              onClick={() =>
                handleSubmitComment({
                  newComment,
                  setNewComment,
                  setLocalComments,
                })
              }
              disabled={!newComment.trim()}
              className="gap-1.5 shadow-sm"
            >
              <Send className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Post</span>
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-2">
          {!hasComments ? (
            <div className="py-10 text-center">
              <MessageCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                No comments yet. Be the first to comment!
              </p>
            </div>
          ) : (
            localComments.map((comment) => (
              <div key={comment._id} className="space-y-3">
                {/* Main Comment */}
                <div className="group rounded-lg border border-transparent bg-background/60 p-3 transition-colors hover:border-border/60 hover:bg-muted/40">
                  <div className="flex gap-3">
                    <Avatar className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 ring-2 ring-background">
                      <AvatarImage
                        src={comment.avatar}
                        alt={comment.username}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xs sm:text-sm font-semibold">
                        {getInitials(comment.username)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1 space-y-2">
                      {/* Username and time */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          @{comment.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          • {comment.timeLabel}
                        </span>
                      </div>

                      {/* Comment content */}
                      <p className="break-words text-sm leading-relaxed text-foreground/90">
                        {comment.content}
                      </p>

                      {/* Action buttons */}
                      <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
                        <button
                          type="button"
                          onClick={() =>
                            handleCommentLike({
                              commentId: comment._id,
                              setLocalComments,
                            })
                          }
                          className="inline-flex items-center gap-1.5 hover:text-primary transition-colors group/like"
                          aria-label={
                            comment.isLiked ? "Unlike comment" : "Like comment"
                          }
                        >
                          <Heart
                            className="h-3.5 w-3.5 transition-transform group-hover/like:scale-110"
                            fill={comment.isLiked ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth={comment.isLiked ? 0 : 2}
                          />
                          {comment.likes > 0 && (
                            <span className="font-medium">
                              {comment.likes}
                            </span>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                              handleToggleReply({
                                commentId: comment._id,
                                setReplyingTo,
                                setReplyText,
                              })
                          }
                          className="inline-flex items-center gap-1.5 font-medium hover:text-primary transition-colors"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          Reply
                        </button>

                        {comment.replies && comment.replies.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {comment.replies.length}{" "}
                            {comment.replies.length === 1
                              ? "reply"
                              : "replies"}
                          </span>
                        )}
                      </div>

                      {/* Reply Input */}
                      {replyingTo === comment._id && (
                        <div className="mt-2 flex gap-2 animate-in slide-in-from-top-2">
                          <Avatar className="h-7 w-7 flex-shrink-0">
                            <AvatarImage src="" alt="You" />
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-[10px] font-semibold">
                              YU
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-1 gap-2">
                            <Input
                              placeholder={`Reply to @${comment.username}...`}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="h-9 text-sm border-border/60 focus-visible:ring-primary/20"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault()
                                  handleSubmitReply({
                                    commentId: comment._id,
                                    replyText,
                                    setReplyText,
                                    setLocalComments,
                                    setReplyingTo,
                                  })
                                }
                              }}
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={() =>
                                handleSubmitReply({
                                  commentId: comment._id,
                                  replyText,
                                  setReplyText,
                                  setLocalComments,
                                  setReplyingTo,
                                })
                              }
                              disabled={!replyText.trim()}
                              className="h-9 gap-1 shadow-sm"
                            >
                              <Send className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-11 space-y-2 border-l border-border/40 pl-4">
                    {comment.replies.map((reply) => (
                      <div
                        key={reply._id}
                        className="group rounded-lg bg-background/60 p-2.5 transition-colors hover:bg-muted/40"
                      >
                        <div className="flex gap-2.5">
                          <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-background">
                            <AvatarImage
                              src={reply.avatar}
                              alt={reply.username}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-primary/15 to-primary/5 text-primary text-[10px] font-semibold">
                              {getInitials(reply.username)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="min-w-0 flex-1 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">
                                @{reply.username}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                • {reply.timeLabel}
                              </span>
                            </div>

                            <p className="break-words text-sm leading-relaxed text-foreground/90">
                              {reply.content}
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                handleReplyLike({
                                  commentId: comment._id,
                                  replyId: reply._id,
                                  setLocalComments,
                                })
                              }
                              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors group/like"
                              aria-label={
                                reply.isLiked ? "Unlike reply" : "Like reply"
                              }
                            >
                              <Heart
                                className="h-3 w-3 transition-transform group-hover/like:scale-110"
                                fill={reply.isLiked ? "currentColor" : "none"}
                                stroke="currentColor"
                                strokeWidth={reply.isLiked ? 0 : 2}
                              />
                              {reply.likes > 0 && (
                                <span className="font-medium">
                                  {reply.likes}
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default CommentSection
