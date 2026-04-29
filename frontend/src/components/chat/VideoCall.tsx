import { useEffect, useRef, useState, useCallback } from "react";
import useChat from "@/hooks/useChat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Phone,
  PhoneIncoming,
  Volume2,
  VolumeX,
  Monitor,
  MonitorOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ImagePath from "@/lib/ImagePath";

export const VideoCall = () => {
  const {
    callState,
    callType,
    incomingCall,
    localStream,
    remoteStream,
    acceptCall,
    rejectCall,
    endCall,
    isScreenSharing,
    startScreenShare,
    stopScreenShare,
  } = useChat();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ─── Attach local stream ───────────────────────────────────────── */
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, callState]);

  /* ─── Attach remote stream ──────────────────────────────────────── */
  const attachRemote = useCallback(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    attachRemote();
  }, [attachRemote, callState]);

  /* ─── Call timer ────────────────────────────────────────────────── */
  useEffect(() => {
    if (callState === "active") {
      setCallDuration(0);
      timerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  const fmtDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const toggleMic = () => {
    localStream?.getAudioTracks().forEach((t) => (t.enabled = isMuted));
    setIsMuted((v) => !v);
  };

  const toggleCam = () => {
    localStream?.getVideoTracks().forEach((t) => (t.enabled = isCamOff));
    setIsCamOff((v) => !v);
  };

  const toggleSpeaker = () => {
    if (remoteVideoRef.current) remoteVideoRef.current.muted = !isSpeakerOff;
    setIsSpeakerOff((v) => !v);
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      await startScreenShare();
    }
  };

  if (callState === "idle") return null;

  const isAudio = callType === "audio";
  const callerName = incomingCall?.callerInfo?.name;
  const callerPic = incomingCall?.callerInfo?.profilepic;
  const callerUsername = incomingCall?.callerInfo?.username;

  /* ─────────────────────────────────────────────────────────
     INCOMING CALL
  ─────────────────────────────────────────────────────────── */
  if (callState === "incoming" && incomingCall) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <div className="bg-background w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
          <div className={cn("h-1.5", isAudio ? "bg-gradient-to-r from-blue-400 to-indigo-500" : "bg-gradient-to-r from-green-400 to-emerald-500")} />

          <div className="flex flex-col items-center px-8 pb-8 pt-6 gap-5">
            <div className="relative">
              <div className={cn("absolute inset-0 rounded-full animate-ping scale-125", isAudio ? "bg-blue-400/20" : "bg-green-500/20")} />
              <Avatar className={cn("h-24 w-24 border-4 shadow-xl relative", isAudio ? "border-blue-400/30" : "border-green-400/30")}>
                <AvatarImage src={ImagePath(callerPic || "")} />
                <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                  {callerName?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="text-center">
              <p className="text-xl font-bold">{callerName}</p>
              {callerUsername && <p className="text-sm text-muted-foreground">@{callerUsername}</p>}
              <div className={cn("mt-2 flex items-center justify-center gap-2 text-sm font-medium", isAudio ? "text-blue-500" : "text-green-500")}>
                <PhoneIncoming className="h-3.5 w-3.5 animate-bounce" />
                Incoming {isAudio ? "voice" : "video"} call
              </div>
            </div>

            <div className="flex gap-10 mt-1">
              <div className="flex flex-col items-center gap-2">
                <button onClick={rejectCall} className="h-16 w-16 rounded-full bg-destructive hover:bg-destructive/90 flex items-center justify-center shadow-lg transition-transform active:scale-95">
                  <PhoneOff className="h-7 w-7 text-white" />
                </button>
                <span className="text-xs text-muted-foreground">Decline</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button onClick={acceptCall} className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-lg transition-transform active:scale-95">
                  <Phone className="h-7 w-7 text-white" />
                </button>
                <span className="text-xs text-muted-foreground">Accept</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────
     CALLING (waiting for answer)
  ─────────────────────────────────────────────────────────── */
  if (callState === "calling") {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-40 w-40 rounded-full border-2 border-primary/20 animate-ping" />
          <div className="absolute h-32 w-32 rounded-full border-2 border-primary/30 animate-ping [animation-delay:300ms]" />
          <div className="h-24 w-24 rounded-full bg-primary/10 border-2 border-primary/40 flex items-center justify-center">
            {isAudio ? <Phone className="h-10 w-10 text-primary" /> : <Video className="h-10 w-10 text-primary" />}
          </div>
        </div>

        <div className="text-center text-white">
          <p className="text-2xl font-bold mb-1">Calling…</p>
          <p className="text-white/50 text-sm">Waiting for answer</p>
        </div>

        <button onClick={endCall} className="h-16 w-16 rounded-full bg-destructive hover:bg-destructive/90 flex items-center justify-center shadow-xl transition-transform active:scale-95">
          <PhoneOff className="h-7 w-7 text-white" />
        </button>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────
     ACTIVE CALL — VIDEO
  ─────────────────────────────────────────────────────────── */
  if (callState === "active" && !isAudio) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex flex-col select-none">
        {/* Remote video — full screen */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="h-28 bg-gradient-to-b from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-black/75 to-transparent" />
        </div>

        {/* Timer + Screen share indicator */}
        <div className="relative flex items-center justify-between px-5 pt-5 z-10">
          <div className="flex items-center gap-2 text-white">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-mono font-semibold">{fmtDuration(callDuration)}</span>
          </div>
          <div className="flex items-center gap-2">
            {isScreenSharing && (
              <div className="flex items-center gap-1.5 bg-green-500/20 text-green-400 text-xs font-semibold px-3 py-1 rounded-full border border-green-500/30">
                <Monitor className="h-3 w-3" />
                Sharing screen
              </div>
            )}
            <span className="text-white/50 text-xs">Video Call</span>
          </div>
        </div>

        {/* Local PiP — top right */}
        <div className="absolute top-16 right-4 w-28 h-40 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-10 cursor-pointer">
          {isCamOff && !isScreenSharing ? (
            <div className="w-full h-full bg-slate-700 flex items-center justify-center">
              <VideoOff className="h-6 w-6 text-white/40" />
            </div>
          ) : (
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          )}
          {isScreenSharing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Monitor className="h-5 w-5 text-green-400" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-4 z-10">
          <ControlBtn
            active={!isMuted}
            onClick={toggleMic}
            activeIcon={<Mic className="h-5 w-5 text-white" />}
            inactiveIcon={<MicOff className="h-5 w-5 text-white" />}
            label={isMuted ? "Unmute" : "Mute"}
          />
          <ControlBtn
            active={!isCamOff}
            onClick={toggleCam}
            activeIcon={<Video className="h-5 w-5 text-white" />}
            inactiveIcon={<VideoOff className="h-5 w-5 text-white" />}
            label={isCamOff ? "Cam on" : "Cam off"}
          />

          {/* Screen Share button */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={toggleScreenShare}
              className={cn(
                "h-12 w-12 rounded-full flex items-center justify-center border shadow-lg transition-all active:scale-95",
                isScreenSharing
                  ? "bg-green-500 hover:bg-green-600 border-green-400/30"
                  : "bg-white/10 hover:bg-white/20 border-white/10 backdrop-blur"
              )}
            >
              {isScreenSharing
                ? <MonitorOff className="h-5 w-5 text-white" />
                : <Monitor className="h-5 w-5 text-white" />}
            </button>
            <span className="text-[10px] text-white/60">{isScreenSharing ? "Stop share" : "Share screen"}</span>
          </div>

          {/* End call */}
          <div className="flex flex-col items-center gap-1">
            <button onClick={endCall} className="h-16 w-16 rounded-full bg-destructive hover:bg-destructive/90 flex items-center justify-center shadow-xl transition-transform active:scale-95">
              <PhoneOff className="h-7 w-7 text-white" />
            </button>
            <span className="text-[10px] text-white/60">End</span>
          </div>

          <ControlBtn
            active={!isSpeakerOff}
            onClick={toggleSpeaker}
            activeIcon={<Volume2 className="h-5 w-5 text-white" />}
            inactiveIcon={<VolumeX className="h-5 w-5 text-white" />}
            label={isSpeakerOff ? "Speaker on" : "Speaker off"}
          />
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────
     ACTIVE CALL — AUDIO ONLY
  ─────────────────────────────────────────────────────────── */
  if (callState === "active" && isAudio) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-8 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 select-none">
        {/* Hidden audio for remote stream */}
        <audio ref={remoteVideoRef as unknown as React.RefObject<HTMLAudioElement>} autoPlay />

        {/* Avatar */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-indigo-400/10 animate-pulse scale-150" />
          <Avatar className="h-28 w-28 border-4 border-indigo-400/30 shadow-2xl relative">
            <AvatarImage src={ImagePath(callerPic || "")} />
            <AvatarFallback className="text-4xl font-bold bg-indigo-600/20 text-white">
              {callerName?.[0] || "?"}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="text-center text-white">
          <p className="text-2xl font-bold">{callerName}</p>
          <div className="mt-2 flex items-center justify-center gap-2 text-indigo-300 text-sm">
            <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            {fmtDuration(callDuration)}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-5">
          <ControlBtn
            active={!isMuted}
            onClick={toggleMic}
            activeIcon={<Mic className="h-5 w-5 text-white" />}
            inactiveIcon={<MicOff className="h-5 w-5 text-white" />}
            label={isMuted ? "Unmute" : "Mute"}
          />
          <div className="flex flex-col items-center gap-1">
            <button onClick={endCall} className="h-16 w-16 rounded-full bg-destructive hover:bg-destructive/90 flex items-center justify-center shadow-xl transition-transform active:scale-95">
              <PhoneOff className="h-7 w-7 text-white" />
            </button>
            <span className="text-[10px] text-white/60">End</span>
          </div>
          <ControlBtn
            active={!isSpeakerOff}
            onClick={toggleSpeaker}
            activeIcon={<Volume2 className="h-5 w-5 text-white" />}
            inactiveIcon={<VolumeX className="h-5 w-5 text-white" />}
            label={isSpeakerOff ? "Speaker on" : "Speaker off"}
          />
        </div>
      </div>
    );
  }

  return null;
};

/* ── Reusable control button ─────────────────────────────────────── */
const ControlBtn = ({
  active,
  onClick,
  activeIcon,
  inactiveIcon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  activeIcon: React.ReactNode;
  inactiveIcon: React.ReactNode;
  label: string;
}) => (
  <div className="flex flex-col items-center gap-1">
    <button
      onClick={onClick}
      className={cn(
        "h-12 w-12 rounded-full flex items-center justify-center border border-white/10 shadow-lg transition-all active:scale-95",
        active ? "bg-white/10 backdrop-blur hover:bg-white/20" : "bg-destructive hover:bg-destructive/90"
      )}
    >
      {active ? activeIcon : inactiveIcon}
    </button>
    <span className="text-[10px] text-white/60">{label}</span>
  </div>
);
