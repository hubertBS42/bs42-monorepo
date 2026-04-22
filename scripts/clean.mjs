import { existsSync, rmSync } from "fs"
import { join } from "path"

const monorepoRoot = process.cwd()

const targets = [
  // Root
  "node_modules",
  // Apps
  "apps/admin/node_modules",
  "apps/admin/.next",
  "apps/store/node_modules",
  "apps/store/.next",
  // Packages
  "packages/db/node_modules",
  "packages/db/dist",
  "packages/db/generated",
  "packages/typescript-config/node_modules",
  "packages/eslint-config/node_modules",
  "packages/ui/node_modules",
  "packages/auth/node_modules",
  "packages/auth/dist",
  // Dist
  "dist",
]

for (const target of targets) {
  const fullPath = join(monorepoRoot, target)
  if (existsSync(fullPath)) {
    console.log(`Removing ${target}...`)
    rmSync(fullPath, { recursive: true, force: true })
  }
}

console.log("✅ Clean complete")
