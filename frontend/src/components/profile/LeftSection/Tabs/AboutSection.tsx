import React, { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"

type AboutData = {
  name: string
  username: string
  bio: string
  skills: string[]
  website?: string
  phoneno?: string
  location?: string
  dob?: string
  pronouns?: string
  profilepic?: string
}

type AboutProps={
  username:string
}

const AboutSection: React.FC<AboutProps> = ({username}) => {

  const [about, setAbout] = useState<AboutData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If no username, show a friendly message instead of infinite loading
    if (!username) {
      setAbout(null)
      setError("No user selected. Please log in to view profile details.")
      setLoading(false)
      return
    }

    const controller = new AbortController()

    const fetchAboutInfo = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(
          `/api/get-about-info/${encodeURIComponent(username)}`,
          { signal: controller.signal }
        )

        // Try to parse JSON safely
        let data = null
        try {
          data = await res.json()
        } catch {
          // If response is not valid JSON
          throw new Error("Invalid server response")
        }

        if (!res.ok || !data?.success) {
          throw new Error(data?.message || "Failed to fetch about info")
        }

        const payload: AboutData = {
          name: data.data?.name ?? "",
          username: data.data?.username ?? username,
          bio: data.data?.bio ?? "",
          skills: Array.isArray(data.data?.skills) ? data.data.skills : [],
          website: data.data?.website ?? undefined,
          phoneno: data.data?.phoneno ?? undefined,
          location: data.data?.location ?? undefined,
          dob: data.data?.dob ?? undefined,
          pronouns: data.data?.pronouns ?? undefined,
          profilepic: data.data?.profilepic ?? undefined,
        }

        setAbout(payload)
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          // Request was aborted, ignore
          return
        }

        console.error("Failed to load about info:", err)

        const message =
          err instanceof Error
            ? err.message
            : "Something went wrong while loading your profile."

        setError(message)
        setAbout(null)
      } finally {
        setLoading(false)
      }
    }

    fetchAboutInfo()

    return () => {
      controller.abort()
    }
  }, [username])

  // Loading skeleton
  if (loading) {
    return (
      <div className="px-6 py-5 space-y-4 text-xs text-muted-foreground">
        <div className="h-4 w-28 rounded bg-muted animate-pulse" />
        <div className="h-3 w-full rounded bg-muted animate-pulse" />
        <div className="h-3 w-5/6 rounded bg-muted animate-pulse" />
        <div className="h-3 w-4/6 rounded bg-muted animate-pulse" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="px-6 py-5 text-xs text-red-500">
        {error}
      </div>
    )
  }

  // No data state
  if (!about) {
    return (
      <div className="px-6 py-5 text-xs text-muted-foreground">
        No about information available yet. Update your profile to add details.
      </div>
    )
  }

  return (
    <div className="space-y-8 rounded-xl bg-background px-6 py-6 text-sm text-foreground">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold tracking-tight">
          About {about.name?.trim() || about.username}
        </h2>
        <p className="text-xs text-muted-foreground">
          A quick overview of who you are, what you do, and how people can reach you.
        </p>
      </div>

      {/* Bio */}
      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Bio
        </h3>
        <div className="rounded-xl border bg-muted/40 px-4 py-3 text-sm leading-relaxed">
          {about.bio?.trim() ? (
            about.bio
          ) : (
            <span className="text-xs text-muted-foreground">
              No bio added yet. Share a short description about yourself, your work, or your interests.
            </span>
          )}
        </div>
      </section>

      {/* Skills */}
      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Skills
        </h3>
        {about.skills && about.skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {about.skills.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="rounded-full px-3 py-1 text-[11px] font-medium"
              >
                {skill}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            No skills added yet. You can add your skills from profile settings.
          </p>
        )}
      </section>

      {/* Details grid */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Profile details
        </h3>

        <div className="grid grid-cols-1 gap-4 rounded-xl border bg-background/40 p-4 sm:grid-cols-2">
          <DetailItem label="Username" value={`@${about.username}`} />

          {about.location && (
            <DetailItem label="Location" value={about.location} />
          )}

          {about.website && (
            <DetailItem
              label="Website"
              value={
                <a
                  href={
                    about.website.startsWith("http")
                      ? about.website
                      : `https://${about.website}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-primary hover:underline"
                >
                  {about.website}
                </a>
              }
            />
          )}

          {about.pronouns && (
            <DetailItem label="Pronouns" value={about.pronouns} />
          )}

          {about.dob && (
            <DetailItem label="Date of Birth" value={about.dob} />
          )}

          {about.phoneno && (
            <DetailItem label="Phone" value={about.phoneno} />
          )}
        </div>
      </section>
    </div>
  )
}

type DetailItemProps = {
  label: string
  value: React.ReactNode
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-medium leading-snug">{value}</p>
    </div>
  )
}

export default AboutSection
