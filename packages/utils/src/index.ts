import { FlatNode, TreeNode } from "@bs42/types"
import slugify from "slugify"

slugify.extend({ ".": "-" })

export const abbreviateName = (name: string) => {
  const names = name.trim().split(/\s+/).filter(Boolean)

  if (names.length === 0) return "?"
  if (names.length === 1) return names[0]?.charAt(0).toUpperCase() ?? "?"

  const firstInitial = names[0]?.charAt(0).toUpperCase() ?? "?"
  const lastInitial = names[names.length - 1]?.charAt(0).toUpperCase() ?? "?"
  return firstInitial + lastInitial
}

export const capitalizeFirstLetter = (value: string) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()

export const formatDuration = (seconds: number, format: "human" | "timestamp" = "human"): string => {
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

export function generateSlug(input: string): string {
  return slugify(input, {
    lower: true,
    strict: true,
  })
}

export const buildNodeTree = <T extends { id: string; parentId: string | null }>(items: T[], parentId: string | null = null): TreeNode<T>[] => {
  return items
    .filter((item) => item.parentId === parentId)
    .map((item) => ({
      ...item,
      children: buildNodeTree(items, item.id),
    }))
}

export const flattenNodeTree = <T extends { id: string; children?: T[] }>(tree: T[], parentId: string | null = null, depth = 0): FlatNode<T>[] => {
  return tree.flatMap((node) => {
    const { children, ...rest } = node
    const flatNode: FlatNode<T> = { ...rest, parentId, depth }

    const childNodes = children ? flattenNodeTree(children, node.id, depth + 1) : []

    return [flatNode, ...childNodes]
  })
}

export const buildParentMap = (items: { id: string; parentId: string | null }[]) => {
  const map = new Map<string | null, string[]>()

  for (const item of items) {
    if (!map.has(item.parentId)) map.set(item.parentId, [])
    map.get(item.parentId)!.push(item.id)
  }

  return map
}

export const collectDescendantIds = (items: { id: string; parentId: string | null }[], startId: string): string[] => {
  const parentMap = buildParentMap(items)

  const result = new Set<string>()
  const stack = [startId]

  while (stack.length > 0) {
    const current = stack.pop()!
    result.add(current)

    const children = parentMap.get(current) || []
    stack.push(...children)
  }

  return Array.from(result)
}

const CURRENCY_FOMATTER = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
  minimumFractionDigits: 2,
})

// Format currency using the formatter above
export function formatCurrency(amount: number | string | null) {
  if (typeof amount === "number") {
    return CURRENCY_FOMATTER.format(amount)
  } else if (typeof amount === "string") {
    return CURRENCY_FOMATTER.format(Number(amount))
  } else {
    return "NaN"
  }
}
