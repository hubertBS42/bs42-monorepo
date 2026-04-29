"use client"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@bs42/ui/components/sidebar"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@bs42/ui/components/collapsible"
import { cn } from "@bs42/ui/lib/utils"
import { Skeleton } from "@bs42/ui/components/skeleton"
import { NavItem, NavSubItem } from "@/types"
import { useNavItems } from "@/hooks/use-nav-items"
import QuickCreateButton from "./quick-create-button"

export function NavMainSkeleton() {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded-lg" />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

const NavMain = () => {
  const { setOpenMobile } = useSidebar()
  const pathname = usePathname()
  const { navItems, isGlobalWorkspace, isAdmin, isLoading } = useNavItems()

  const isActive = (url: string): boolean => {
    if (pathname.includes("/add")) {
      const parts = pathname.split("/")
      parts.pop()
      return parts.join("/") === url
    }

    if (pathname.includes("/edit") || pathname.includes("/details")) {
      const parts = pathname.split("/")
      // Remove 'edit' and the id before it
      parts.pop() // remove 'edit'
      parts.pop() // remove the id
      return parts.join("/") === url
    }

    return pathname === url
  }

  const hasActiveChild = (items?: NavSubItem[]): boolean => {
    if (!items) return false
    return items.some((item) => {
      if (isActive(item.url)) return true
      if (item.items) return hasActiveChild(item.items)
      return false
    })
  }

  if (isLoading) return <NavMainSkeleton />

  const renderNavItem = (item: NavItem) =>
    item.items ? (
      <Collapsible
        key={item.title}
        asChild
        defaultOpen={isActive(item.url) || hasActiveChild(item.items)}
      >
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            tooltip={item.title}
            isActive={isActive(item.url) || hasActiveChild(item.items)}
          >
            <Link href={item.url}>
              {item.icon && <item.icon />}
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
          <CollapsibleTrigger asChild>
            <SidebarMenuAction className="data-[state=open]:rotate-90">
              <ChevronRight />
              <span className="sr-only">Toggle</span>
            </SidebarMenuAction>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.items?.map((subItem) => (
                <Collapsible
                  key={subItem.title}
                  asChild
                  defaultOpen={
                    isActive(subItem.url) || hasActiveChild(subItem.items)
                  }
                >
                  <SidebarMenuSubItem>
                    {subItem.items ? (
                      <>
                        <SidebarMenuSubButton asChild>
                          <Link
                            href={subItem.url}
                            className={cn(
                              "flex w-full items-center justify-between",
                              {
                                "bg-accent text-accent-foreground":
                                  isActive(subItem.url) ||
                                  hasActiveChild(subItem.items),
                              }
                            )}
                          >
                            {subItem.icon && <subItem.icon />}
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuAction className="data-[state=open]:rotate-90">
                            <ChevronRight />
                            <span className="sr-only">Toggle</span>
                          </SidebarMenuAction>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub className="ml-4">
                            {subItem.items.map((nestedItem) => (
                              <SidebarMenuSubItem key={nestedItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isActive(nestedItem.url)}
                                >
                                  <Link
                                    href={nestedItem.url}
                                    onClick={() => setOpenMobile(false)}
                                  >
                                    {nestedItem.icon && <nestedItem.icon />}
                                    <span>{nestedItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </>
                    ) : (
                      <SidebarMenuSubButton
                        asChild
                        isActive={isActive(subItem.url)}
                      >
                        <Link
                          href={subItem.url}
                          onClick={() => setOpenMobile(false)}
                        >
                          {subItem.icon && <subItem.icon />}
                          <span>{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    )}
                  </SidebarMenuSubItem>
                </Collapsible>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    ) : (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          tooltip={item.title}
          asChild
          isActive={isActive(item.url)}
        >
          <Link href={item.url} onClick={() => setOpenMobile(false)}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )

  return (
    <>
      {/* Main nav */}
      {navItems.main && (
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            {isAdmin && isGlobalWorkspace && (
              <SidebarMenu>
                <SidebarMenuItem className="flex items-center gap-2">
                  <QuickCreateButton />
                </SidebarMenuItem>
              </SidebarMenu>
            )}

            <SidebarMenu>
              {navItems.main?.map((item) => renderNavItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {/* Secondary nav */}
      {navItems.secondary && (
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.secondary.map((item) => renderNavItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
    </>
  )
}

export default NavMain
