import React from "react"

// Optional shared types – structure-based, so they work with your existing interfaces
export interface Reply {
  _id: string
  username: string
  avatar?: string
  content: string
  timeLabel: string
  likes: number
  isLiked: boolean
}

export interface Comment {
  _id: string
  username: string
  avatar?: string
  content: string
  timeLabel: string
  likes: number
  isLiked: boolean
  replies?: Reply[]
}

export const handleCommentClick = ({
  e,
  setShowComment,
}: {
  e: React.MouseEvent<HTMLSpanElement>
  setShowComment: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  e.stopPropagation()
  setShowComment((prev) => !prev)
  console.log("Comment button clicked")
}

// Reset reply state
export const resetReplyState = ({
  setReplyingTo,
  setReplyText,
}: {
  setReplyingTo: React.Dispatch<React.SetStateAction<string | null>>
  setReplyText: React.Dispatch<React.SetStateAction<string>>
}) => {
  setReplyingTo(null)
  setReplyText("")
}

// Add a new top-level comment
export const handleSubmitComment = ({
  newComment,
  setNewComment,
  setLocalComments,
  username = "current_user",
  avatar = "",
}: {
  newComment: string
  setNewComment: React.Dispatch<React.SetStateAction<string>>
  setLocalComments: React.Dispatch<React.SetStateAction<Comment[]>>
  username?: string
  avatar?: string
}) => {
  if (!newComment.trim()) return

  const tempComment: Comment = {
    _id: Date.now().toString(),
    username,
    avatar,
    content: newComment.trim(),
    timeLabel: "Just now",
    likes: 0,
    isLiked: false,
    replies: [],
  }

  setLocalComments((prev) => [tempComment, ...prev])
  setNewComment("")
}

// Add a reply to a specific comment
export const handleSubmitReply = ({
  commentId,
  replyText,
  setReplyText,
  setLocalComments,
  setReplyingTo,
  username = "current_user",
  avatar = "",
}: {
  commentId: string
  replyText: string
  setReplyText: React.Dispatch<React.SetStateAction<string>>
  setLocalComments: React.Dispatch<React.SetStateAction<Comment[]>>
  setReplyingTo: React.Dispatch<React.SetStateAction<string | null>>
  username?: string
  avatar?: string
}) => {
  if (!replyText.trim()) return

  const newReply: Reply = {
    _id: `${commentId}-${Date.now()}`,
    username,
    avatar,
    content: replyText.trim(),
    timeLabel: "Just now",
    likes: 0,
    isLiked: false,
  }

  setLocalComments((prev) =>
    prev.map((comment) =>
      comment._id === commentId
        ? {
            ...comment,
            replies: [...(comment.replies || []), newReply],
          }
        : comment
    )
  )

  setReplyText("")
  setReplyingTo(null)
}

// Toggle like on a comment
export const handleCommentLike = ({
  commentId,
  setLocalComments,
}: {
  commentId: string
  setLocalComments: React.Dispatch<React.SetStateAction<Comment[]>>
}) => {
  setLocalComments((prev) =>
    prev.map((comment) =>
      comment._id === commentId
        ? {
            ...comment,
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
          }
        : comment
    )
  )
}

// Toggle like on a reply
export const handleReplyLike = ({
  commentId,
  replyId,
  setLocalComments,
}: {
  commentId: string
  replyId: string
  setLocalComments: React.Dispatch<React.SetStateAction<Comment[]>>
}) => {
  setLocalComments((prev) =>
    prev.map((comment) =>
      comment._id === commentId
        ? {
            ...comment,
            replies: comment.replies?.map((reply) =>
              reply._id === replyId
                ? {
                    ...reply,
                    isLiked: !reply.isLiked,
                    likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                  }
                : reply
            ),
          }
        : comment
    )
  )
}

// Open / close reply box for a given comment
export const handleToggleReply = ({
  commentId,
  setReplyingTo,
  setReplyText,
}: {
  commentId: string
  setReplyingTo: React.Dispatch<React.SetStateAction<string | null>>
  setReplyText: React.Dispatch<React.SetStateAction<string>>
}) => {
  setReplyingTo((current) => {
    const isSame = current === commentId
    if (!isSame) setReplyText("")
    return isSame ? null : commentId
  })
}
