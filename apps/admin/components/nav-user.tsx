"use client"

import {
  EllipsisVerticalIcon,
  CircleUserRoundIcon,
  CreditCardIcon,
  BellIcon,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@bs42/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@bs42/ui/components/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@bs42/ui/components/sidebar"
import Link from "next/link"
import SignOutButton from "./sign-out-button"
import { Skeleton } from "@bs42/ui/components/skeleton"
import { authClient } from "@/lib/auth-client"
import { abbreviateName } from "@bs42/utils"

export const NavUserSkeleton = () => {
  return <Skeleton className="h-12 w-full rounded-lg" />
}

const NavUser = () => {
  const { isMobile } = useSidebar()
  const { data: session, isPending } = authClient.useSession()

  if (!isPending && session) {
    const { user } = session
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.image || ""} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {abbreviateName(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
                <EllipsisVerticalIcon className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.image || ""} alt={user.name} />
                    <AvatarFallback className="rounded-lg">
                      {abbreviateName(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href={"/account"} className="cursor-pointer">
                    <CircleUserRoundIcon />
                    Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCardIcon />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BellIcon />
                  Notifications
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <SignOutButton
                  variant="ghost"
                  className="w-full cursor-pointer justify-start"
                />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }
}

export default NavUser
