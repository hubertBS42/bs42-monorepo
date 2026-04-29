"use client"

import { Skeleton } from "@bs42/ui/components/skeleton"
import { authClient } from "@/lib/auth-client"
import { cn } from "@bs42/ui/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { href: "/store", label: "Overview" },
  { href: "/store/members", label: "Members" },
  { href: "/store/invitations", label: "Invitations" },
  // { href: '/store/logs', label: 'Logs' },
]

const Header = () => {
  const pathname = usePathname()
  const { data: activeStore, isPending } = authClient.useActiveOrganization()
  return (
    <div className="grid gap-y-6">
      <div className="grid">
        {isPending ? (
          <Skeleton className="h-7 w-48 md:h-8 md:w-80" />
        ) : (
          <h1 className="text-xl font-bold md:text-2xl">{activeStore?.name}</h1>
        )}
        <p className="text-sm text-muted-foreground">Manage this store</p>
      </div>
      <nav className="flex gap-1 border-b">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "-mb-px border-b-2 px-3 pb-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
export default Header
