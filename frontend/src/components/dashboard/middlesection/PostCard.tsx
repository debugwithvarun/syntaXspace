import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Link2, Send } from "lucide-react";
import { useIdle } from "@/hooks/useIdle";
import { useAuth } from "@/hooks/useAuth";
import { handleLikeClick } from "@/lib/LikeFunction";
import { handleCommentClick } from "@/lib/CommentFunction";
import { apiFetch } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CommentSection from "@/components/postCard/CommentSection";
import type { PostSummary } from "./MiddleSection";
import ImagePath from "@/lib/ImagePath";
import { Link } from "react-router-dom";
import useChat from "@/hooks/useChat";
import usePop from "@/hooks/usePop";

const PostCard: React.FC<PostSummary> = ({
  _id,
  title,
  description,
  likes_count,
  isError,
  likes,
  owner,
  profilepic,
  username,
  timeLabel = "Just now",
  language
}) => {
  const { setOpenView, setId } = useIdle();
  const { name, username: Authuser } = useAuth();
  const { selectedChat, sendMessageToConversation, setOpenChat } = useChat();
  const { setMsg, setPopUp } = usePop();

  const [liked, setLiked] = useState<string[]>(likes);
  const [likeCount, setLikeCount] = useState<number>(likes_count ?? 0);
  const [isLiked, setIsLiked] = useState<boolean>(liked.includes(Authuser));
  const [showComment, setShowComment] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [comment, setComment] = useState<any[]>([]);
  const [isCmnt, setIsCmnt] = useState(false);

  // --- Like animation states ---
  const [likePulse, setLikePulse] = useState(false);
  const [showPlus, setShowPlus] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await apiFetch(
          `/syntaxspace/get-comments/${_id}?username=${username}`
        );
        const { data } = await res.json();
        setComment(data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };
    fetchComments();
  }, [_id, isCmnt, username]);

  useEffect(() => {
    if (likePulse) {
      const t = setTimeout(() => setLikePulse(false), 350);
      return () => clearTimeout(t);
    }
  }, [likePulse]);

  useEffect(() => {
    if (showPlus) {
      const t = setTimeout(() => setShowPlus(false), 700);
      return () => clearTimeout(t);
    }
  }, [showPlus]);

  const handleOpenView = () => {
    setId(_id);
    setOpenView(true);
  };

  const likeLabel = useMemo(() => {
    if (likeCount === 0) return "Like";
    if (!isLiked) return `${likeCount} like${likeCount > 1 ? "s" : ""}`;
    if (likeCount === 1) return "You";
    const others = likeCount - 1;
    return `You & ${others} other${others > 1 ? "s" : ""}`;
  }, [isLiked, likeCount]);

  const shareLink = `${window.location.origin}/community/${username}?post=${_id}`;

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(shareLink);
      setMsg("Post link copied");
      setPopUp("ds");
    } catch {
      setMsg("Failed to copy link");
      setPopUp("de");
    }
  };

  const handleSendToChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedChat?._id) {
      setOpenChat(true);
      setMsg("Select a chat first, then share");
      setPopUp("dw");
      return;
    }
    sendMessageToConversation(selectedChat._id, `Check this code post: ${shareLink}`);
    setMsg("Post link sent in chat");
    setPopUp("ds");
  };

  return (
    <Card
      onClick={handleOpenView}
      className={`relative bg-bac group cursor-pointer rounded-xl p-0 border-0 transition-transform
        ${isError ? "" : ""}
      `}
    >
      <div className="flex items-stretch">
        <div
          className={`w-1 rounded-l-xl
            ${isError ? "bg-red-500" : "bg-linear-to-b from-primary/80 to-primary/40"}
          `}
          aria-hidden
        />

        <div
          className={`
            w-full bg-background rounded-r-xl p-5 sm:p-6
            border border-border/60
            transition-all duration-200
            relative
          `}
        >
          <div
            className="absolute right-3 top-3 flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {isError ? (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-semibold text-white shadow">
                <svg width="10" height="10" viewBox="0 0 24 24" className="inline-block shrink-0">
                  <path fill="currentColor" d="M11.001 2h2v12h-2zM11 18h2v2h-2z" />
                </svg>
                Error
              </div>
            ) : likeCount >= 50 ? (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-yellow-400/95 px-2.5 py-0.5 text-xs font-semibold text-black shadow">
                ★ Popular
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-semibold text-white shadow">
                <svg width="10" height="10" viewBox="0 0 24 24" className="inline-block shrink-0">
                  <path fill="currentColor" d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/>
                </svg>
                Working
              </div>
            )}

           <div className="hidden sm:flex items-center gap-2">
              <span className="text-[11px] font-medium rounded-full px-2.5 py-0.5 bg-muted/60 text-muted-foreground border">
                #{language}
              </span>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 ring-1 ring-border/40">
                <AvatarImage src={ImagePath(profilepic)} alt={owner} />
                <AvatarFallback>{owner.split(" ").map(n => n[0]).join("")}</AvatarFallback>
              </Avatar>

              <div className="leading-tight">
                <Link
                  to={`/community/${username}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-block"
                >
                  <h5 className="text-sm font-semibold hover:underline">{owner}</h5>
                  <p className="text-xs text-muted-foreground">@{username}</p>
                </Link>
              </div>
            </div>


          </div>

          <h3 className="mt-4 text-base sm:text-lg font-semibold text-primary line-clamp-2">
            {title}
          </h3>

          <div className="mt-2 relative">
            <p className="text-sm leading-relaxed text-muted-foreground line-clamp-4">
              {description}
            </p>

            <div
              className="pointer-events-none absolute left-0 right-0 bottom-0 h-8"

            />
          </div>

          <div
            className="mt-4 flex items-center justify-between gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const willLike = !isLiked;
                  handleLikeClick({
                    e,
                    _id,
                    setIsLiked,
                    setLikeCount,
                    setLiked
                  });
                  setLikePulse(true);
                  if (willLike) setShowPlus(true);
                }}
                className="relative inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm transition-all duration-150
                  hover:bg-muted/70 active:scale-95 focus:outline-none"
                aria-label="Like"
              >
                <Heart
                  className={`h-4 w-4 transition-transform ${isLiked ? "fill-primary text-primary" : "stroke-muted-foreground text-muted-foreground"}`}
                  style={{ transform: likePulse ? "scale(1.18)" : undefined }}
                />
                <span className={`font-medium text-sm transition-transform ${likePulse ? "scale-105" : "scale-100"} ${isLiked ? "text-primary" : "text-muted-foreground"}`}>
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
              </button>

              <button
                onClick={(e) => handleCommentClick({ e, setShowComment })}
                className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm text-muted-foreground "
              >
                <MessageCircle className="h-4 w-4" />
                <span>{comment.length} Comment{comment.length >= 1 ? "s" : ""}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm text-muted-foreground hover:bg-muted/70"
                title="Copy post link"
              >
                <Link2 className="h-4 w-4" />
                <span>Copy link</span>
              </button>

              <button
                onClick={handleSendToChat}
                className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm text-muted-foreground hover:bg-muted/70"
                title="Send in selected chat"
              >
                <Send className="h-4 w-4" />
                <span>Send to chat</span>
              </button>

  
            </div>

            <div className="text-xs text-muted-foreground">{timeLabel}</div>
          </div>



          {showComment && (
            <div
              className="mt-3 rounded-xl px-3 animate-in slide-in-from-top-2"
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
      </div>

      <style>{`
        @keyframes likeFloat {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          60% { transform: translateY(-18px) scale(1.05); opacity: 0.9; }
          100% { transform: translateY(-32px) scale(0.95); opacity: 0; }
        }
      `}</style>
    </Card>
  );
};

export default PostCard;
