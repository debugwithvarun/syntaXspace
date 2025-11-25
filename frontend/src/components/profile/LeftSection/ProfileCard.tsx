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

const UserList: React.FC<{ users: MiniUser[]; emptyText: string }> = ({
  users,
  emptyText,
}) => {
  if (!users.length) {
    return (
      <p className="text-sm text-muted-foreground">
        {emptyText}
      </p>
    )
  }

  return (
    <ul className="space-y-6 max-h-72 overflow-y-auto pr-1 scrollbar-none">
      {users.map((user) => (
        <li
          key={user.username}
          className="flex items-center gap-2 text-sm"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={ImagePath(user.profilepic || "")} alt={user.name} />
            <AvatarFallback>
              {user.name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium leading-tight">
              {user.name}
            </span>
            <span className="text-xs text-muted-foreground">
              @{user.username}
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}

const ProfileCard = ({ name,username, profilepic, networkStats, loadingStats }:{ name: string; username: string; profilepic?: string; networkStats: NetworkStats; loadingStats: boolean }) => {

  return (
    <Card className="w-full overflow-hidden rounded-xl border-0 rounded-b-none">
      {/* Wrapper */}
      <div className="flex flex-col gap-6 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left section: avatar + identity + actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center flex-1 min-w-0">
          {/* Avatar */}
          <Avatar className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl border-4 border-background shadow-md shrink-0">
            <AvatarImage src={profilepic} alt={name || "User avatar"} />
            <AvatarFallback className="text-3xl sm:text-4xl font-semibold">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>

          {/* Name + subtitle + actions */}
          <div className="mt-2 space-y-2 sm:mt-0 sm:ml-3 min-w-0">
            {/* Name + verified */}
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl md:text-2xl">
                {name || "User Name"}
              </h1>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-[12px] font-semibold uppercase text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                verified
              </span>
            </div>

            {/* Subtitle */}
            <p className="max-w-md text-sm text-muted-foreground">
              {networkStats.bio || "Interface and Brand Designer based in San Antonio"}
            </p>

            {/* Actions */}
              {/* <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  Follow
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Get in touch
                </Button>
              </div> */}
          </div>
        </div>

        {/* Right section: badges + stats */}
        <div className="flex flex-col gap-4 w-full lg:w-auto lg:items-end">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 justify-start lg:justify-end">
            {networkStats.skills && networkStats.skills.map((skill) => (
              <Badge key={skill} className="bg-secondary">{skill}</Badge>
            ))}
          </div>

          {/* Stats (with dialog triggers) */}
          <div className="grid grid-cols-2 gap-3 text-center sm:gap-6 sm:text-right">
            {/* Followers dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex flex-col items-center sm:items-end h-auto px-1 sm:px-2 py-1 sm:py-2"
                >
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Followers
                  </p>
                  <p className="text-lg font-semibold leading-tight sm:text-xl md:text-2xl">
                    {loadingStats ? "—" : formatCount(networkStats.followersCount)}
                  </p>
                  <span className="text-[11px] text-muted-foreground mt-0.5">
                    View all
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Followers</DialogTitle>
                  <DialogDescription>
                    People who are following @{username}
                  </DialogDescription>
                </DialogHeader>

                {loadingStats ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : (
                  <UserList
                    users={networkStats.followers}
                    emptyText="No followers yet."
                  />
                )}
              </DialogContent>
            </Dialog>

            {/* Following dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex flex-col items-center sm:items-end h-auto px-1 sm:px-2 py-1 sm:py-2"
                >
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Following
                  </p>
                  <p className="text-lg font-semibold leading-tight sm:text-xl md:text-2xl">
                    {loadingStats ? "—" : formatCount(networkStats.followingCount)}
                  </p>
                  <span className="text-[11px] text-muted-foreground mt-0.5">
                    View all
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Following</DialogTitle>
                  <DialogDescription>
                    People @{username} is following
                  </DialogDescription>
                </DialogHeader>

                {loadingStats ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : (
                  <UserList
                    users={networkStats.following}
                    emptyText="Not following anyone yet."
                  />
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default ProfileCard
