import React from "react"
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

import ImagePath from "@/lib/ImagePath"
import type { MiniUser, NetworkStats } from "./LeftSection"

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
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      </div>
    )
  }

  return (
    <ul className="space-y-3 max-h-80 overflow-y-auto">
      {users.map((user) => (
        <li
          key={user.username}
          className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-secondary/50 transition-colors"
        >
          <Avatar className="h-10 w-10 shrink-0 border-2 border-background">
            <AvatarImage
              src={ImagePath(user.profilepic || "")}
              alt={user.name || user.username}
            />
            <AvatarFallback className="bg-primary/20 text-primary font-semibold">
              {user.name?.[0]?.toUpperCase() || user.username[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-semibold leading-tight truncate text-foreground">
              {user.name || user.username}
            </span>
            <span className="text-xs text-muted-foreground truncate">
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
        className="flex flex-col items-center gap-1 py-2 px-4 hover:bg-secondary/50 transition-colors rounded-lg h-auto"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="text-xl sm:text-2xl font-bold text-foreground">
          {loading ? "—" : value}
        </span>
      </Button>
    </DialogTrigger>
    <DialogContent className="max-w-sm">
      <DialogHeader>
        <DialogTitle className="text-lg">{title}</DialogTitle>
        <DialogDescription className="text-sm">
          {description.replace("@username", `@${username}`)}
        </DialogDescription>
      </DialogHeader>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">Loading...</p>
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

const ProfileCardComponent: React.FC<ProfileCardProps> = ({

  networkStats,
  loadingStats,
}) => {
  const hasSkills = Boolean(networkStats.skills && networkStats.skills.length)

  return (
    <Card className="w-full overflow-hidden border-0 rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="p-4 sm:p-6">
        {/* Header: Avatar + Info */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
          {/* Avatar Section */}
          <div className="shrink-0">
            <Avatar className="h-32 w-32 rounded-2xl border-4 border-primary/10 shadow-lg">
              <AvatarImage src={networkStats.profilepic} alt={networkStats.name || "User avatar"} />
              <AvatarFallback className="text-4xl font-bold bg-primary/20 text-primary">
                {getInitials(networkStats.name)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Name + Verified + Bio */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Name + Verified Badge */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground truncate">
                  {networkStats.name || "User Name"}
                </h1>
                {networkStats.verified && (
                  <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-300 border-0 text-xs font-bold uppercase">
                    ✓ Verified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground font-medium">@{networkStats.username}</p>
            </div>

            {/* Bio */}
            {networkStats.bio && (
              <p className="text-sm text-foreground leading-relaxed max-w-md">
                {networkStats.bio}
              </p>
            )}

            {/* Stats Row */}
            <div className="flex gap-2 pt-2">
            <Button
        variant="ghost"
        className="flex flex-col items-center gap-1 py-2 px-4 hover:bg-secondary/50 transition-colors rounded-lg h-auto"
      >
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Post
              </span>
              <span className="text-xl sm:text-2xl font-bold text-foreground">
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
          </div>
        </div>

        {/* Skills Section */}
        {hasSkills && (
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Skills & Interests
            </p>
            <div className="flex flex-wrap gap-2">
              {networkStats.skills!.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="px-3 py-1 text-xs font-medium hover:bg-primary/20 transition-colors"
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
