"use client"

import { NavUserSkeleton } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@bs42/ui/components/sidebar"
import dynamic from "next/dynamic"
import { StoreSwitcherSkeleton } from "@/components/store-switcher"
import { NavMainSkeleton } from "@/components/nav"
import { ComponentProps } from "react"

const NavUser = dynamic(() => import("./nav-user"), {
  ssr: false,
  loading: () => <NavUserSkeleton />,
})
const Nav = dynamic(() => import("@/components/nav"), {
  ssr: false,
  loading: () => <NavMainSkeleton />,
})
const StoreSwitcher = dynamic(() => import("@/components/store-switcher"), {
  ssr: false,
  loading: () => <StoreSwitcherSkeleton />,
})

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <StoreSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <Nav />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
