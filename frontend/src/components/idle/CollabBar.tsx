import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useIdle } from "@/hooks/useIdle";
import useChat from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import usePop from "@/hooks/usePop";

const makeSessionId = () => Math.random().toString(36).slice(2, 10);

export default function CollabBar() {
  const { socket } = useChat();
  const { _id, userId, name, username } = useAuth();
  const {
    code,
    language,
    languageId,
    stdin,
    title,
    desc,
    setCode,
    setLanguage,
    setLanguageId,
    setStdin,
    setTitle,
    setDesc,
    collabSessionId,
    setCollabSessionId,
    collabUsers,
    setCollabUsers,
    isCollabConnected,
    setIsCollabConnected,
  } = useIdle();
  const { setMsg, setPopUp } = usePop();

  const [joinValue, setJoinValue] = useState("");
  const applyingRemoteRef = useRef(false);

  const me = useMemo(
    () => ({ _id: _id || userId, name: name || "You", username: username || "" }),
    [_id, userId, name, username]
  );

  const activeId = collabSessionId || joinValue;

  const joinSession = (sessionId: string) => {
    if (!socket || !sessionId.trim()) return;
    const normalized = sessionId.trim();
    setCollabSessionId(normalized);
    setIsCollabConnected(true);
    socket.emit("collab-join", { sessionId: normalized, user: me });
    setMsg(`Joined session ${normalized}`);
    setPopUp("ds");
  };

  const createSession = () => {
    const id = makeSessionId();
    setJoinValue(id);
    joinSession(id);
  };

  const leaveSession = () => {
    if (!socket || !collabSessionId) return;
    socket.emit("collab-leave", { sessionId: collabSessionId });
    setIsCollabConnected(false);
    setCollabSessionId("");
    setCollabUsers([]);
    setMsg("Left collaboration session");
    setPopUp("dw");
  };

  const copySessionLink = async () => {
    const sid = collabSessionId || joinValue;
    if (!sid) return;
    const url = `${window.location.origin}${window.location.pathname}?collab=${encodeURIComponent(sid)}`;
    try {
      await navigator.clipboard.writeText(url);
      setMsg("Collab link copied");
      setPopUp("ds");
    } catch {
      setMsg("Failed to copy collab link");
      setPopUp("de");
    }
  };

  useEffect(() => {
    if (!socket) return;

    const onUsers = ({ sessionId, users }: { sessionId: string; users: { _id: string; name: string; username?: string }[] }) => {
      if (sessionId !== collabSessionId) return;
      setCollabUsers(users || []);
    };

    const onState = ({ sessionId, state }: { sessionId: string; state: Record<string, unknown> }) => {
      if (sessionId !== collabSessionId || !state) return;
      applyingRemoteRef.current = true;
      if (typeof state.code === "string") setCode(state.code);
      if (typeof state.language === "string") setLanguage(state.language);
      if (typeof state.languageId === "number") setLanguageId(state.languageId);
      if (typeof state.stdin === "string") setStdin(state.stdin);
      if (typeof state.title === "string") setTitle(state.title);
      if (typeof state.desc === "string") setDesc(state.desc);
      setTimeout(() => {
        applyingRemoteRef.current = false;
      }, 0);
    };

    socket.on("collab-users", onUsers);
    socket.on("collab-state", onState);
    return () => {
      socket.off("collab-users", onUsers);
      socket.off("collab-state", onState);
    };
  }, [socket, collabSessionId, setCode, setDesc, setLanguage, setLanguageId, setStdin, setTitle, setCollabUsers]);

  useEffect(() => {
    if (!socket || !collabSessionId || !isCollabConnected) return;
    if (applyingRemoteRef.current) return;

    socket.emit("collab-sync", {
      sessionId: collabSessionId,
      patch: { code, language, languageId, stdin, title, desc },
    });
  }, [socket, collabSessionId, isCollabConnected, code, language, languageId, stdin, title, desc]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("collab");
    if (sid && !isCollabConnected) {
      setJoinValue(sid);
      joinSession(sid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCollabConnected, socket]);

  useEffect(() => {
    return () => {
      if (socket && collabSessionId) {
        socket.emit("collab-leave", { sessionId: collabSessionId });
      }
    };
  }, [socket, collabSessionId]);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-border/60 bg-muted/20 px-2 py-2">
      <Input
        value={activeId}
        onChange={(e) => setJoinValue(e.target.value)}
        placeholder="Session ID"
        className="h-8 w-[140px] text-xs"
        disabled={isCollabConnected}
      />
      {!isCollabConnected ? (
        <>
          <Button size="sm" className="h-8 text-xs" onClick={() => joinSession(joinValue)}>
            Join
          </Button>
          <Button size="sm" variant="secondary" className="h-8 text-xs" onClick={createSession}>
            Create
          </Button>
        </>
      ) : (
        <>
          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={copySessionLink}>
            Copy Link
          </Button>
          <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={leaveSession}>
            Leave
          </Button>
          <span className="text-xs text-muted-foreground">
            Live: {collabUsers.length} collaborator{collabUsers.length === 1 ? "" : "s"}
          </span>
        </>
      )}
    </div>
  );
}
