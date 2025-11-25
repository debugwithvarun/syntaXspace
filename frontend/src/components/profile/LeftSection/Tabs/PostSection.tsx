import React, { useEffect, useState } from "react"

import { useAuth } from "@/hooks/useAuth"
import PostCard from "./PostCard"

export type PostSummary = {
  _id: string
  title: string
  description: string
  commentCount: number
  likes:string[]
  comment:[]
  likes_count: number
  timeLabel:string
}

interface PostsResponse {
  success: boolean
  message?: string
  data?: PostSummary[]
}

const PostSection: React.FC = () => {
  const { username } = useAuth()
  const [posts, setPosts] = useState<PostSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

useEffect(() => {
  // No username → no need to hit API
  if (!username) {
    setPosts([])
    setError("Please log in to view your posts.")
    setLoading(false)
    return
  }

  const controller = new AbortController()

  const loadPosts = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/syntaxspace/get-post", {
        signal: controller.signal,
      })

      const json: PostsResponse = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch posts.")
      }

      setPosts(json.data ?? [])
    } catch (err) {
      // Ignore unmount / dependency change abort
      if (err instanceof DOMException && err.name === "AbortError") return

      console.error("Error fetching posts:", err)
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading your posts."
      )
    } finally {
      setLoading(false)
    }
  }

  loadPosts()

  return () => controller.abort()
}, [username])


  if (loading) {
    return (
      <div className="flex w-full flex-col gap-4">
        <div className="h-24 w-full rounded-lg bg-muted animate-pulse" />
        <div className="h-24 w-full rounded-lg bg-muted animate-pulse" />
        <div className="h-24 w-full rounded-lg bg-muted animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        {error}
      </div>
    )
  }

  if (!posts.length) {
    return (
      <div className="w-full rounded-lg border border-border/60 bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
        You haven&apos;t posted anything yet. Share your first code snippet!
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col gap-4">
      {posts.map((post) => (
        <PostCard
          key={post._id}
          _id={post._id}
          title={post.title}
          description={post.description}
          likes_count={post.likes_count}
          likes={post.likes}
          comment={post.comment}
          commentCount={post.commentCount}
          timeLabel={post.timeLabel}
        />
      ))}
    </div>
  )
}

export default PostSection
