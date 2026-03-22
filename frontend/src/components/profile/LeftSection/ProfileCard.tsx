import React, { useEffect, useState, useCallback } from "react"
import { Card } from "../../ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar"
import { Button } from "../../ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"

import { UserPlus, Mail, Ban, ShieldCheck } from "lucide-react"
import ImagePath from "@/lib/ImagePath"
import type { MiniUser, NetworkStats } from "./LeftSection"
import { useAuth } from "@/hooks/useAuth"
import useChat from "@/hooks/useChat"
import { apiFetch } from "@/lib/api"

const formatCount = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toString()
}

const getInitials = (fullName?: string) => {
  if (!fullName) return "You"
  const parts = fullName.trim().split(" ")
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U"
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

type UserListProps = {
  users: MiniUser[]
  emptyText: string
}

const UserList: React.FC<UserListProps> = React.memo(({ users, emptyText }) => {
  if (!users.length) {
    return (
      <div className="flex items-center justify-center py-6">
        <p className="text-xs text-muted-foreground">{emptyText}</p>
      </div>
    )
  }

  return (
    <ul className="space-y-2.5 max-h-80 overflow-y-auto">
      {users.map((user) => (
        <li
          key={user.username}
          className="flex items-center gap-2.5 text-xs p-2 rounded-md hover:bg-secondary/50 transition-colors"
        >
          <Avatar className="h-8 w-8 shrink-0 border border-border">
            <AvatarImage
              src={ImagePath(user.profilepic || "")}
              alt={user.name || user.username}
            />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {user.name?.[0]?.toUpperCase() || user.username[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-medium leading-tight truncate text-foreground">
              {user.name || user.username}
            </span>
            <span className="text-[11px] text-muted-foreground truncate">
              @{user.username}
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
})
UserList.displayName = "UserList"

type StatItemProps = {
  label: string
  value: string | number
  loading: boolean
  username: string
  users: MiniUser[]
  title: string
  description: string
}

const StatItem: React.FC<StatItemProps> = ({
  label,
  value,
  loading,
  username,
  users,
  title,
  description,
}) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button
        variant="ghost"
        className="h-auto px-3 py-1.5 rounded-lg flex flex-col items-start gap-0.5 hover:bg-secondary/60"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
          {label}
        </span>
        <span className="text-sm font-semibold text-foreground">
          {loading ? "—" : value}
        </span>
      </Button>
    </DialogTrigger>
    <DialogContent className="max-w-sm">
      <DialogHeader>
        <DialogTitle className="text-sm font-semibold">{title}</DialogTitle>
        <DialogDescription className="text-xs">
          {description.replace("@username", `@${username}`)}
        </DialogDescription>
      </DialogHeader>
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <p className="text-xs text-muted-foreground">Loading...</p>
        </div>
      ) : (
        <UserList users={users} emptyText={`No ${label.toLowerCase()} yet.`} />
      )}
    </DialogContent>
  </Dialog>
)

type ProfileCardProps = {
  networkStats: NetworkStats
  loadingStats: boolean
}

type InviteStatus = "idle" | "sent" | "already" | "loading"

const ProfileCardComponent: React.FC<ProfileCardProps> = ({
  networkStats,
  loadingStats,
}) => {
  const hasSkills = Boolean(networkStats.skills && networkStats.skills.length)

  const { username } = useAuth()
  const { blockUser, unblockUser, isBlocked } = useChat()
  const isOwnProfile = username === networkStats.username
  const [inviteStatus, setInviteStatus] = useState<InviteStatus>("loading")
  const [actionLoading, setActionLoading] = useState(false)
  const [blockActionLoading, setBlockActionLoading] = useState(false)

  // For block we need the target user's _id
  // We'll fetch it if not available
  const [targetId, setTargetId] = useState<string | null>(null)

  const targetUsername = networkStats.username

  // Fetch targetId for block actions
  useEffect(() => {
    if (!targetUsername || isOwnProfile) return;
    apiFetch(`/get-about-info/${targetUsername}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.data?._id) setTargetId(d.data._id);
      })
      .catch(() => {});
  }, [targetUsername, isOwnProfile]);

  const blocked = targetId ? isBlocked(targetId) : false;

  const handleToggleBlock = async () => {
    if (!targetId) return;
    setBlockActionLoading(true);
    try {
      if (blocked) {
        await unblockUser(targetId);
      } else {
        await blockUser(targetId);
      }
    } finally {
      setBlockActionLoading(false);
    }
  };

  const fetchStatus = useCallback(async () => {
    if (!targetUsername || isOwnProfile) {
      setInviteStatus("idle")
      return
    }

    try {
      const res = await apiFetch(`/check-status/${targetUsername}`)
      if (!res.ok) throw new Error("Failed to fetch status")
      const data = await res.json()
      if (data?.status === "already" || data?.status === "sent" || data?.status === "idle") {
        setInviteStatus(data.status)
      } else {
        setInviteStatus("idle")
      }
    } catch (error) {
      console.error("Error fetching invite status:", error)
      setInviteStatus("idle")
    }
  }, [targetUsername, isOwnProfile])

  useEffect(() => {
    setInviteStatus("loading")
    fetchStatus()
  }, [fetchStatus])

  // For Invite / Cancel request
  const handleInviteClick = async () => {
    if (isOwnProfile || !targetUsername || inviteStatus === "loading") return
    if (inviteStatus === "already") return // handled via dialog

    setActionLoading(true)
    try {
      if (inviteStatus === "idle") {
        const res = await apiFetch(`/sent-request`, {
          method: "PUT",
          body: JSON.stringify({ target: targetUsername }),
        })
        if (!res.ok) throw new Error("Failed to send request")
        setInviteStatus("sent")
      } else if (inviteStatus === "sent") {
        const res = await apiFetch(`/delete-sent-request/${targetUsername}`, {
          method: "DELETE",
        })
        if (!res.ok) throw new Error("Failed to cancel request")
        setInviteStatus("idle")
      }
    } catch (error) {
      console.error("Error updating invite status:", error)
    } finally {
      setActionLoading(false)
    }
  }

  // For Unfollow (status === "already") – triggered from AlertDialogAction
  const handleUnfollow = async () => {
    if (isOwnProfile || !targetUsername) return

    setActionLoading(true)
    try {
      const res = await apiFetch(`/remove-following/${targetUsername}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to unfollow")
      setInviteStatus("idle")
    } catch (error) {
      console.error("Error unfollowing user:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const inviteLabel = (() => {
    if (inviteStatus === "sent") return "Invite sent"
    if (inviteStatus === "already") return "Following"
    return "Invite"
  })()

  const inviteVariant: "default" | "outline" =
    inviteStatus === "idle" || inviteStatus === "loading" ? "default" : "outline"

  return (
    <Card className="w-full overflow-hidden border-0 rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-4 sm:p-5">
        {/* Top section: avatar + info in row, content in column */}
        <div className="flex gap-4 sm:gap-5 items-start">
          {/* Avatar */}
          <div className="shrink-0">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-2 border-primary/10 shadow-sm">
              <AvatarImage
                src={networkStats.profilepic}
                alt={networkStats.name || "User avatar"}
              />
              <AvatarFallback className="text-xl sm:text-2xl font-semibold bg-primary/10 text-primary">
                {getInitials(networkStats.name)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Right side: name, about, stats, actions */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            {/* Name + verified + username */}
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-semibold tracking-tight text-foreground truncate">
                  {networkStats.name || "User Name"}
                </h1>
                {networkStats.verified && (
                  <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-300 border-0 text-[10px] font-semibold uppercase tracking-[0.08em]">
                    ✓ Verified
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                @{networkStats.username}
              </p>
            </div>

            {/* About/Bio */}
            {networkStats.bio && (
              <p className="text-xs text-foreground leading-relaxed max-w-md">
                {networkStats.bio}
              </p>
            )}

            {/* Stats in ONE row: Post | Followers | Following */}
            <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
              <Button
                variant="ghost"
                className="h-auto px-3 py-1.5 rounded-lg flex flex-col items-start gap-0.5 hover:bg-secondary/60"
              >
                <span className="text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                  Posts
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {networkStats.postCount || 0}
                </span>
              </Button>
              <StatItem
                label="Followers"
                value={formatCount(networkStats.followersCount)}
                loading={loadingStats}
                username={networkStats.username}
                users={networkStats.followers}
                title="Followers"
                description="People following @username"
              />
              <StatItem
                label="Following"
                value={formatCount(networkStats.followingCount)}
                loading={loadingStats}
                username={networkStats.username}
                users={networkStats.following}
                title="Following"
                description="People @username is following"
              />
            </div>

            {/* Actions: Invite + Get in touch + Block */}
            {!isOwnProfile && (
              <div className="mt-1.5 flex flex-wrap gap-2">
                {inviteStatus === "already" ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant={inviteVariant}
                        className="rounded-full px-3 h-8 text-xs"
                        disabled={actionLoading}
                      >
                        <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                        {inviteLabel}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Unfollow user</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to unfollow{" "}
                          <b>@{networkStats.username}</b>? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleUnfollow}>
                          Yes, unfollow
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <Button
                    size="sm"
                    variant={inviteVariant}
                    className="rounded-full px-3 h-8 text-xs"
                    onClick={handleInviteClick}
                    disabled={actionLoading || inviteStatus === "loading"}
                  >
                    <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                    {inviteLabel}
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full px-3 h-8 text-xs"
                >
                  <Mail className="h-3.5 w-3.5 mr-1.5" />
                  Get in touch
                </Button>

                {/* Block / Unblock */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className={`rounded-full px-3 h-8 text-xs ${
                        blocked
                          ? "text-green-600 border-green-500/40 hover:bg-green-50"
                          : "text-destructive border-destructive/30 hover:bg-destructive/5"
                      }`}
                      disabled={blockActionLoading || !targetId}
                    >
                      {blocked ? (
                        <><ShieldCheck className="h-3.5 w-3.5 mr-1.5" />Unblock</>
                      ) : (
                        <><Ban className="h-3.5 w-3.5 mr-1.5" />Block</>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {blocked ? "Unblock" : "Block"} @{networkStats.username}?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {blocked
                          ? "They will be able to interact with you again."
                          : "They won't be able to message you or appear in your search results."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleToggleBlock}>
                        Yes, {blocked ? "unblock" : "block"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </div>

        {/* Skills */}
        {hasSkills && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-2">
              Skills & Interests
            </p>
            <div className="flex flex-wrap gap-1.5">
              {networkStats.skills!.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="px-2.5 py-1 text-[11px] font-medium hover:bg-primary/10"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

const ProfileCard = React.memo(ProfileCardComponent)
ProfileCard.displayName = "ProfileCard"

export default ProfileCard
