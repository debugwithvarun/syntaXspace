
export const getTimeLabel = (date: string) => {
  if (!date) return "Just now"

  const diff = Date.now() - new Date(date).getTime()
  const seconds = Math.floor(diff / 1000)

  if (Number.isNaN(seconds) || seconds < 0) return "Just now"

  const units = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ]

  for (const unit of units) {
    const value = Math.floor(seconds / unit.seconds)
    if (value >= 1) {
      return `${value} ${unit.label}${value > 1 ? "s" : ""} ago`
    }
  }

  return "Just now"
}