import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Send, X, Trash2 } from "lucide-react";
import {
  handleCommentLike,
  handleToggleReply,
  handleReplyLike,
  handleSubmitComment,
  handleSubmitReply,
  handleDeleteComment,
  handleDeleteReply,
} from "@/lib/CommentFunction";
import { getTimeLabel } from "@/lib/getTimeLabel";
import { useAuth } from "@/hooks/useAuth";
import ImagePath from "@/lib/ImagePath";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Reply {
  _id: string;
  username: string;
  avatar: string;
  text: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
}

interface Comment {
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

interface CommentSectionProps {
  isCmnt: boolean;
  setIsCmnt: React.Dispatch<React.SetStateAction<boolean>>;
  name: string;
  username: string; // post author's username (not necessarily viewer)
  postId: string;
  comments?: Comment[];
  onClose?: () => void;
}

const getInitials = (username: string): string => {
  const clean = username.replace(/[_\s]+/g, " ").trim();
  if (!clean) return "U";

  const parts = clean.split(" ").filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";

  return (first + second || first || "U").toUpperCase().slice(0, 2);
};

type OpenRepliesState = Record<string, boolean>;

interface ReplyItemProps {
  reply: Reply;
  authUsername: string;
  profilepic: string;
  postId: string;
  commentId: string;
  setLocalComments: React.Dispatch<React.SetStateAction<Comment[]>>;
}

const ReplyItem: React.FC<ReplyItemProps> = React.memo(
  ({ reply, authUsername, profilepic, postId, commentId, setLocalComments }) => {
    const handleLike = useCallback(() => {
      handleReplyLike({
        postId,
        commentId,
        replyId: reply._id,
        setLocalComments,
      });
    }, [postId, commentId, reply._id, setLocalComments]);

    const isOwner = reply.username === authUsername;

    return (
      <div className="group rounded-lg bg-background/60 p-2.5 transition-colors hover:bg-muted/40">
        <div className="flex gap-2.5">
          <Avatar className="h-8 w-8 shrink-0 ring-2 ring-background">
            <AvatarImage
              src={
                reply.avatar === profilepic
                  ? profilepic
                  : ImagePath(reply.avatar)
              }
              alt={reply.username}
            />
            <AvatarFallback className="bg-linear-to-br from-primary/15 to-primary/5 text-primary text-[10px] font-semibold">
              {getInitials(reply.username)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                @{reply.username === authUsername ? "You" : reply.username}
              </span>
              <span className="text-xs text-muted-foreground">
                • {getTimeLabel(reply.createdAt)}
              </span>
            </div>

            <p className="wrap-break-words text-sm leading-relaxed text-foreground/90">
              {reply.text}
            </p>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleLike}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors group/like"
                aria-label={reply.isLiked ? "Unlike reply" : "Like reply"}
              >
                <Heart
                  className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                    reply.isLiked
                      ? "fill-primary text-primary"
                      : "fill-none stroke-muted-foreground text-muted-foreground"
                  }`}
                />
                {reply.likes > 0 && (
                  <span className="font-medium">{reply.likes}</span>
                )}
              </button>

              {isOwner && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs text-destructive/80 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete reply?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This reply will be permanently removed. This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() =>
                          handleDeleteReply({
                            postId,
                            commentId,
                            replyId: reply._id,
                            setLocalComments,
                          })
                        }
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ReplyItem.displayName = "ReplyItem";

interface CommentItemProps {
  comment: Comment;
  authUsername: string;
  profilepic: string;
  postId: string;
  replyingTo: string | null;
  replyText: string;
  isRepliesOpen: boolean;
  setReplyText: React.Dispatch<React.SetStateAction<string>>;
  setReplyingTo: React.Dispatch<React.SetStateAction<string | null>>;
  setLocalComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  toggleRepliesVisibility: (commentId: string) => void;
  setIsCmnt?: React.Dispatch<React.SetStateAction<boolean>>;
}

const CommentItem: React.FC<CommentItemProps> = React.memo(
  ({
    comment,
    authUsername,
    profilepic,
    postId,
    replyingTo,
    replyText,
    isRepliesOpen,
    setReplyText,
    setReplyingTo,
    setLocalComments,
    toggleRepliesVisibility,
    setIsCmnt,
  }) => {
    const repliesCount = comment.replies?.length ?? 0;
    const isOwner = comment.username === authUsername;

    const onCommentLike = useCallback(() => {
      handleCommentLike({
        postId,
        commentId: comment._id,
        setLocalComments,
      });
    }, [postId, comment._id, setLocalComments]);

    const onReplyToggle = useCallback(() => {
      handleToggleReply({
        commentId: comment._id,
        setReplyingTo,
        setReplyText,
      });
    }, [comment._id, setReplyingTo, setReplyText]);

    const onSubmitReply = useCallback(() => {
      handleSubmitReply({
        postId,
        commentId: comment._id,
        username: authUsername,
        avatar: profilepic,
        replyText,
        setReplyText,
        setLocalComments,
        setReplyingTo,
        setIsCmnt,
      });
    }, [
      postId,
      comment._id,
      authUsername,
      profilepic,
      replyText,
      setReplyText,
      setLocalComments,
      setReplyingTo,
      setIsCmnt,
    ]);

    return (
      <div className="space-y-3">
        {/* Main Comment */}
        <div className="group rounded-lg border border-transparent bg-background/60 p-3 transition-colors hover:border-border/60 hover:bg-muted/40">
          <div className="flex gap-3">
            <Avatar className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 ring-2 ring-background">
              <AvatarImage
                src={
                  comment.avatar === profilepic
                    ? profilepic
                    : ImagePath(comment.avatar)
                }
                alt={comment.username}
              />
              <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/10 text-primary text-xs sm:text-sm font-semibold">
                {comment.username === authUsername
                  ? "You"
                  : getInitials(comment.username)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 space-y-2">
              {/* Username and time */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  @{comment.username === authUsername ? "You" : comment.username}
                </span>
                <span className="text-xs text-muted-foreground">
                  • {getTimeLabel(comment.createdAt)}
                </span>
              </div>

              {/* Comment content */}
              <p className="wrap-break-words text-sm leading-relaxed text-foreground/90">
                {comment.text}
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-muted-foreground">
                {/* Like comment */}
                <button
                  type="button"
                  onClick={onCommentLike}
                  className="inline-flex items-center gap-1.5 hover:text-primary transition-colors group/like"
                  aria-label={
                    comment.isLiked ? "Unlike comment" : "Like comment"
                  }
                >
                  <Heart
                    className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                      comment.isLiked
                        ? "fill-primary text-primary"
                        : "fill-none stroke-muted-foreground text-muted-foreground"
                    }`}
                  />
                  {comment.likes > 0 && (
                    <span className="font-medium">{comment.likes}</span>
                  )}
                </button>

                {/* Reply button */}
                <button
                  type="button"
                  onClick={onReplyToggle}
                  className="inline-flex items-center gap-1.5 font-medium hover:text-primary transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Reply
                </button>

                {/* View replies toggle */}
                {repliesCount > 0 && (
                  <button
                    type="button"
                    onClick={() => toggleRepliesVisibility(comment._id)}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground/80 transition-colors"
                  >
                    {isRepliesOpen
                      ? "Hide replies"
                      : `View ${repliesCount} ${
                          repliesCount === 1 ? "reply" : "replies"
                        }`}
                  </button>
                )}

                {/* Delete comment (owner only) */}
                {isOwner && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs text-destructive/80 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete comment?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This comment will be permanently removed. This action
                          cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() =>
                            setIsCmnt && handleDeleteComment({
                              postId,
                              commentId: comment._id,
                              setLocalComments,
                              setIsCmnt
                            })
                          }
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>

              {/* Reply Input */}
              {replyingTo === comment._id && (
                <div className="mt-2 flex gap-2 animate-in slide-in-from-top-2">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage src={profilepic} alt="You" />
                    <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/10 text-primary text-[10px] font-semibold">
                      {getInitials(authUsername || "U")}
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
                          e.preventDefault();
                          onSubmitReply();
                        }
                      }}
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={onSubmitReply}
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

        {/* Replies (collapsible) */}
        {comment.replies &&
          comment.replies.length > 0 &&
          isRepliesOpen && (
            <div className="ml-11 space-y-2 border-l border-border/40 pl-4">
              {comment.replies.map((reply) => (
                <ReplyItem
                  key={reply._id}
                  reply={reply}
                  authUsername={authUsername}
                  profilepic={profilepic}
                  postId={postId}
                  commentId={comment._id}
                  setLocalComments={setLocalComments}
                />
              ))}
            </div>
          )}
      </div>
    );
  }
);

CommentItem.displayName = "CommentItem";

const CommentSection: React.FC<CommentSectionProps> = ({
  setIsCmnt,
  isCmnt,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  username: _postOwnerUsername,
  name,
  comments = [],
  postId,
  onClose,
}) => {
  const { username: authUsername = "", profilepic = "" } = useAuth() || {};
  const [newComment, setNewComment] = useState("");
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [openReplies, setOpenReplies] = useState<OpenRepliesState>({});

  const hasComments = useMemo(() => localComments.length > 0, [localComments]);
 
  const toggleRepliesVisibility = useCallback((commentId: string) => {
    setOpenReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  }, []);

  const submitNewComment = useCallback(() => {
    handleSubmitComment({
      username: authUsername,
      name,
      postId,
      avatar: profilepic,
      newComment,
      setNewComment,
      setLocalComments,
      setIsCmnt, // 🔁 toggle on new comment
    });
  }, [
    authUsername,
    name,
    postId,
    profilepic,
    newComment,
    setLocalComments,
    setIsCmnt,
  ]);


  useEffect(()=>{
    setLocalComments(comments);
  },[isCmnt,setLocalComments,comments])
  return (
    <div className="backdrop-blur-sm space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-border/40">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground">
            Comments
          </span>
          <span className="text-xs text-muted-foreground">
            {localComments.length === 0
              ? "No comments yet"
              : `${localComments.length} ${
                  localComments.length === 1 ? "comment" : "comments"
                }`}
          </span>
        </div>

        {onClose && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/60"
            aria-label="Close comments"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {/* Add Comment Form */}
        <div className="flex gap-3 pb-2 border-b border-border/40">
          <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
            <AvatarImage src={profilepic} alt="You" />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xs sm:text-sm font-semibold">
              {getInitials(authUsername || name || "User")}
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
                  e.preventDefault();
                  submitNewComment();
                }
              }}
            />
            <Button
              size="sm"
              onClick={submitNewComment}
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
            <div className="py-8 text-center">
              <MessageCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                No comments yet. Be the first to comment!
              </p>
            </div>
          ) : (
            localComments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                authUsername={authUsername}
                profilepic={profilepic}
                postId={postId}
                replyingTo={replyingTo}
                replyText={replyText}
                isRepliesOpen={!!openReplies[comment._id]}
                setReplyText={setReplyText}
                setReplyingTo={setReplyingTo}
                setLocalComments={setLocalComments}
                toggleRepliesVisibility={toggleRepliesVisibility}
                setIsCmnt={setIsCmnt} // 🔁 pass down so replies also toggle
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
