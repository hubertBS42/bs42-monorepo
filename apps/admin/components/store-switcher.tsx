"use client"

import { ChevronsUpDown, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import { Avatar, AvatarFallback, AvatarImage } from "@bs42/ui/components/avatar"
import { abbreviateName, capitalizeFirstLetter } from "@bs42/utils"
import { Skeleton } from "@bs42/ui/components/skeleton"
import { authClient } from "@/lib/auth-client"
import { useStoreSwitcher } from "@/hooks/use-store-switch"
import Link from "next/link"

export const StoreSwitcherSkeleton = () => {
  return <Skeleton className="h-12 w-full rounded-lg" />
}

const StoreSwitcher = () => {
  const { isMobile } = useSidebar()
  const { switchStore, isSwitching } = useStoreSwitcher()
  const { data: stores, isPending: isStoresLoading } =
    authClient.useListOrganizations()
  const { data: session, isPending: isSessionLoading } = authClient.useSession()

  const isLoading = isStoresLoading || isSessionLoading

  if (isLoading || isSwitching) return <StoreSwitcherSkeleton />

  if (!session) return null

  const isAdmin =
    session.user.role === "admin" || session.user.role === "superAdmin"
  const activeStore = stores?.find(
    (store) => store.id === session.session.activeOrganizationId
  )
  const clientStores =
    stores
      ?.filter((store) => store.slug !== "global")
      .sort((a, b) => a.name.localeCompare(b.name)) ?? []

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="border data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarImage
                  src={activeStore?.logo ?? ""}
                  alt={activeStore?.name ?? "?"}
                />
                <AvatarFallback className="rounded-lg">
                  {abbreviateName(activeStore?.name ?? "?")}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeStore?.name ?? "?"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {activeStore?.slug === "global"
                    ? "Administrator"
                    : capitalizeFirstLetter(activeStore?.plan ?? "?")}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-90 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Stores
            </DropdownMenuLabel>

            {isAdmin && (
              <DropdownMenuCheckboxItem
                className="gap-2 px-1 py-1.5 text-sm"
                onClick={() => switchStore({ storeSlug: "global" })}
                checked={activeStore?.slug === "global"}
              >
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage src={""} alt={"Global"} />
                  <AvatarFallback className="rounded-lg">
                    {abbreviateName("Global")}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{"Global"}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Administrator
                  </span>
                </div>
              </DropdownMenuCheckboxItem>
            )}

            {clientStores.map((store) => {
              return (
                <DropdownMenuCheckboxItem
                  key={store.id}
                  className="gap-2 px-1 py-1.5 text-sm"
                  onClick={() => switchStore({ storeId: store.id })}
                  checked={store.id === activeStore?.id}
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={store.logo || ""} alt={store.name} />
                    <AvatarFallback className="rounded-lg">
                      {abbreviateName(store.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{store.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {capitalizeFirstLetter(store.plan)}
                    </span>
                  </div>
                </DropdownMenuCheckboxItem>
              )
            })}

            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 p-2" asChild>
                  <Link href={"/stores/add"}>
                    <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                      <Plus className="size-4" />
                    </div>
                    <div className="font-medium text-muted-foreground">
                      Add Store
                    </div>
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export default StoreSwitcher
