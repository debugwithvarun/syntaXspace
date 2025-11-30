import React from "react";

export interface Reply {
  _id: string;
  username: string;
  avatar: string;
  text: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
}

export interface Comment {
  _id: string;
  username: string;
  name: string;
  avatar: string;
  text: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  replies?: Reply[];
}

export const handleCommentClick = ({
  e,
  setShowComment,
}: {
  e: React.MouseEvent<HTMLSpanElement>;
  setShowComment: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  e.stopPropagation();
  setShowComment((prev) => !prev);
};

export const resetReplyState = ({
  setReplyingTo,
  setReplyText,
}: {
  setReplyingTo: React.Dispatch<React.SetStateAction<string | null>>;
  setReplyText: React.Dispatch<React.SetStateAction<string>>;
}) => {
  setReplyingTo(null);
  setReplyText("");
};

// ========== ADD COMMENT ==========
export const handleSubmitComment = async ({
  newComment,
  setNewComment,
  postId,
  setLocalComments,
  username,
  avatar,
  name,
  setIsCmnt, // 🔹 optional toggle
}: {
  newComment: string;
  setNewComment: React.Dispatch<React.SetStateAction<string>>;
  setLocalComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  postId: string;
  username: string;
  avatar: string;
  name: string;
  setIsCmnt?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  if (!newComment.trim()) return;

  try {
    const res = await fetch(`/api/syntaxspace/add-comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        text: newComment.trim(),
        postId,
      }),
      credentials: "include",
    });

    if (!res.ok) {
      console.error("Failed to add comment");
      return;
    }

    const tempComment: Comment = {
      _id: Date.now().toString(),
      username,
      name,
      avatar,
      text: newComment.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      replies: [],
    };

    setLocalComments((prev) => [tempComment, ...prev]);
    setNewComment("");

    // 🔁 toggle flag so parent can react (refetch, update count, etc.)
    setIsCmnt?.((prev) => !prev);
  } catch (error) {
    console.error("Error adding comment:", error);
  }
};

// ========== ADD REPLY ==========
export const handleSubmitReply = async ({
  commentId,
  postId,
  replyText,
  setReplyText,
  setLocalComments,
  setReplyingTo,
  username,
  avatar = "",
  setIsCmnt, // 🔹 optional toggle
}: {
  commentId: string;
  replyText: string;
  postId: string;
  setReplyText: React.Dispatch<React.SetStateAction<string>>;
  setLocalComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  setReplyingTo: React.Dispatch<React.SetStateAction<string | null>>;
  username: string;
  avatar: string;
  setIsCmnt?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  if (!replyText.trim()) return;

  try {
    const res = await fetch(`/api/syntaxspace/add-reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        text: replyText.trim(),
        postId,
        commentId,
      }),
      credentials: "include",
    });

    if (!res.ok) {
      console.error("Failed to add reply");
      return;
    }

    const newReply: Reply = {
      _id: `${commentId}-${Date.now()}`,
      username,
      avatar,
      text: replyText.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
    };

    setLocalComments((prev) =>
      prev.map((comment) =>
        comment._id === commentId
          ? {
              ...comment,
              replies: [...(comment.replies || []), newReply],
            }
          : comment
      )
    );

    setReplyText("");
    setReplyingTo(null);

    // 🔁 toggle flag so parent can react
    setIsCmnt?.((prev) => !prev);
  } catch (error) {
    console.error("Error adding reply:", error);
  }
};

// ========== COMMENT LIKE ==========
export const handleCommentLike = async ({
  postId,
  commentId,
  setLocalComments,
}: {
  postId: string;
  commentId: string;
  setLocalComments: React.Dispatch<React.SetStateAction<Comment[]>>;
}) => {
  try {
    const res = await fetch(`/api/syntaxspace/comment-like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        postId,
        commentId,
      }),
      credentials: "include",
    });

    if (!res.ok) {
      console.error("Failed to like comment");
      return;
    }

    const data = await res.json();
    const { liked, likes } = data;

    setLocalComments((prev) =>
      prev.map((comment) =>
        comment._id === commentId
          ? {
              ...comment,
              isLiked: liked,
              likes,
            }
          : comment
      )
    );
  } catch (error) {
    console.error("Error liking comment:", error);
  }
};

// ========== REPLY LIKE ==========
export const handleReplyLike = async ({
  postId,
  commentId,
  replyId,
  setLocalComments,
}: {
  postId: string;
  commentId: string;
  replyId: string;
  setLocalComments: React.Dispatch<React.SetStateAction<Comment[]>>;
}) => {
  try {
    const res = await fetch(`/api/syntaxspace/reply-like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        postId,
        commentId,
        replyId,
      }),
      credentials: "include",
    });

    if (!res.ok) {
      console.error("Failed to like reply");
      return;
    }

    const data = await res.json();
    const { liked, likes } = data;

    setLocalComments((prev) =>
      prev.map((comment) =>
        comment._id === commentId
          ? {
              ...comment,
              replies: comment.replies?.map((reply) =>
                reply._id === replyId
                  ? {
                      ...reply,
                      isLiked: liked,
                      likes,
                    }
                  : reply
              ),
            }
          : comment
      )
    );
  } catch (error) {
    console.error("Error liking reply:", error);
  }
};

// ========== OPEN/CLOSE REPLY INPUT ==========
export const handleToggleReply = ({
  commentId,
  setReplyingTo,
  setReplyText,
}: {
  commentId: string;
  setReplyingTo: React.Dispatch<React.SetStateAction<string | null>>;
  setReplyText: React.Dispatch<React.SetStateAction<string>>;
}) => {
  setReplyingTo((current) => {
    const isSame = current === commentId;
    if (!isSame) setReplyText("");
    return isSame ? null : commentId;
  });
};

// ========== DELETE COMMENT ==========
export const handleDeleteComment = async ({
  postId,
  commentId,
  setLocalComments,
  setIsCmnt
}: {
  postId: string;
  commentId: string;
  setLocalComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  setIsCmnt:React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  try {
    const res = await fetch(`/api/syntaxspace/delete-comment`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, commentId }),
      credentials: "include",
    });

    if (!res.ok) {
      console.error("Failed to delete comment");
      return;
    }

    setLocalComments((prev) =>
      prev.filter((comment) => comment._id !== commentId)
    );
    setIsCmnt((prev:boolean)=>!prev)
  } catch (error) {
    console.error("Error deleting comment:", error);
  }
};

// ========== DELETE REPLY ==========
export const handleDeleteReply = async ({
  postId,
  commentId,
  replyId,
  setLocalComments,
}: {
  postId: string;
  commentId: string;
  replyId: string;
  setLocalComments: React.Dispatch<React.SetStateAction<Comment[]>>;
}) => {
  try {
    const res = await fetch(`/api/syntaxspace/delete-reply`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, commentId, replyId }),
      credentials: "include",
    });

    if (!res.ok) {
      console.error("Failed to delete reply");
      return;
    }

    setLocalComments((prev) =>
      prev.map((comment) =>
        comment._id === commentId
          ? {
              ...comment,
              replies: comment.replies?.filter(
                (reply) => reply._id !== replyId
              ),
            }
          : comment
      )
    );
  } catch (error) {
    console.error("Error deleting reply:", error);
  }
};
