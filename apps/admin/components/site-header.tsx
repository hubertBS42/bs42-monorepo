"use client"
import { Separator } from "@bs42/ui/components/separator"
import { SidebarTrigger } from "@bs42/ui/components/sidebar"
import { BREADCRUMB_DATA } from "@/constants"
import { usePathname } from "next/navigation"
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@bs42/ui/components/breadcrumb"
import { Fragment } from "react/jsx-runtime"
import { cn } from "@bs42/ui/lib/utils"
import Link from "next/link"
import ThemeToggle from "@bs42/ui/components/theme-toggle"

export function SiteHeader() {
  const pathname = usePathname()

  // Find matching breadcrumb configuration
  const findBreadcrumbConfig = () => {
    // First, try exact match
    let breadcrumbConfig = BREADCRUMB_DATA.find(
      (item) => item.pathname === pathname
    )

    // If no exact match, try pattern matching for dynamic routes
    if (!breadcrumbConfig) {
      breadcrumbConfig = BREADCRUMB_DATA.find((item) => {
        // Convert dynamic route pattern to regex
        const pathPattern = item.pathname.replace(/\[.*?\]/g, "[^/]+")
        const regex = new RegExp(`^${pathPattern}$`)
        return regex.test(pathname)
      })
    }

    return breadcrumbConfig
  }

  const breadcrumbConfig = findBreadcrumbConfig()
  const segments = breadcrumbConfig?.segments || [
    { text: "Dashboard", href: "/" },
  ]
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 my-auto data-[orientation=vertical]:h-4"
        />
        <BreadcrumbList>
          {segments.map((segment, index) => {
            return (
              <Fragment key={index}>
                <BreadcrumbItem
                  className={cn({
                    "hidden md:block": index !== segments.length - 1,
                  })}
                >
                  {index !== segments.length - 1 ? (
                    <BreadcrumbLink asChild>
                      <Link href={segment.href}>{segment.text}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{segment.text}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index !== segments.length - 1 && (
                  <BreadcrumbSeparator
                    className={cn({
                      "hidden md:block": index !== segments.length - 1,
                    })}
                  />
                )}
              </Fragment>
            )
          })}
        </BreadcrumbList>
        <ThemeToggle className="ml-auto" />
      </div>
    </header>
  )
}
