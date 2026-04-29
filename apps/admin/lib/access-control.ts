import {
  Building2,
  LayoutDashboard,
  LucideIcon,
  ScrollTextIcon,
  UsersIcon,
} from "lucide-react"
import { SystemRole } from "@bs42/auth"
import { NavSubItem } from "@/types"

interface RoutePermission {
  role: SystemRole[]
  context: ("global" | "store")[]
  nav?: {
    title: string
    icon: LucideIcon
    group: "main" | "secondary"
    order: number
    items?: NavSubItem[]
  }
}

export const routePermissions: Record<string, RoutePermission> = {
  "/": {
    role: ["superAdmin", "admin", "user"],
    context: ["global", "store"],
    nav: {
      title: "Dashboard",
      icon: LayoutDashboard,
      group: "main",
      order: 1,
    },
  },
  "/stores": {
    role: ["superAdmin", "admin"],
    context: ["global"],
    nav: {
      title: "Stores",
      icon: Building2,
      group: "main",
      order: 2,
    },
  },
  "/users": {
    role: ["superAdmin", "admin"],
    context: ["global"],
    nav: {
      title: "Users",
      icon: UsersIcon,
      group: "main",
      order: 3,
    },
  },
  "/logs": {
    role: ["superAdmin", "admin"],
    context: ["global"],
    nav: {
      title: "Logs",
      icon: ScrollTextIcon,
      group: "main",
      order: 4,
    },
  },
  "/store": {
    role: ["superAdmin", "admin", "user"],
    context: ["store"],
    nav: {
      title: "Store",
      icon: Building2,
      group: "main",
      order: 2,
      items: [
        {
          title: "Members",
          url: "/store/members",
          context: ["store"],
        },
        {
          title: "Invitations",
          url: "/store/invitations",
          context: ["store"],
        },
        // {
        //   title: "Logs",
        //   url: "/store/logs",
        //   context: ["store"],
        // },
      ],
    },
  },
  "/account/profile": {
    role: ["superAdmin", "admin", "user"],
    context: ["global", "store"],
  },
  "/account/password": {
    role: ["superAdmin", "admin", "user"],
    context: ["global", "store"],
  },
}
