export const abbreviateName = (name: string) => {
  const names = name.trim().split(/\s+/).filter(Boolean)

  if (names.length === 0) return "?"
  if (names.length === 1) return names[0]?.charAt(0).toUpperCase() ?? "?"

  const firstInitial = names[0]?.charAt(0).toUpperCase() ?? "?"
  const lastInitial = names[names.length - 1]?.charAt(0).toUpperCase() ?? "?"
  return firstInitial + lastInitial
}

export const capitalizeFirstLetter = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()

export const formatDuration = (
  seconds: number,
  format: "human" | "timestamp" = "human"
): string => {
  if (format === "timestamp") {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":")
  }

  // Human readable
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? "s" : ""}`
  }

  const minutes = seconds / 60

  if (minutes < 60) {
    const roundedMinutes = Math.round(minutes)
    return `${roundedMinutes} minute${roundedMinutes !== 1 ? "s" : ""}`
  }

  const hours = minutes / 60

  if (hours % 1 === 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""}`
  }

  const roundedHours = Math.round(hours * 10) / 10
  return `${roundedHours} hour${roundedHours !== 1 ? "s" : ""}`
}

export const formatAppNameForEmail = (appName: string | undefined): string => {
  if (!appName) return ""

  // Check if the appName contains a dot (domain-like)
  if (appName.includes(".")) {
    const dotIndex = appName.indexOf(".")
    const beforeDot = appName.substring(0, dotIndex)
    const afterDot = appName.substring(dotIndex)
    return `${beforeDot}\u200D${afterDot}`
  } else {
    if (appName.length <= 2) {
      return appName
    }
    const insertPosition = Math.ceil(appName.length / 2)
    return `${appName.substring(0, insertPosition)}\u200D${appName.substring(insertPosition)}`
  }
}
