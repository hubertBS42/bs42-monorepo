import { NavItem } from "@/types"
import { authClient } from "@/lib/auth-client"
import { routePermissions } from "@/lib/access-control"
import { SystemRole } from "@bs42/auth"

const getNavItems = (
  role: SystemRole,
  isGlobalWorkspace: boolean
): Record<string, NavItem[]> => {
  const currentContext = isGlobalWorkspace ? "global" : "store"

  return (
    Object.entries(routePermissions)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, permission]) => {
        if (!permission.nav) return false
        const hasRole = permission.role.includes(role)
        const hasContext = permission.context.includes(currentContext)
        return hasRole && hasContext
      })
      .map(([url, permission]) => {
        const filteredSubItems = permission.nav?.items?.filter(
          (item) => !item.context || item.context.includes(currentContext)
        )

        return {
          url,
          ...permission.nav!,
          items: filteredSubItems?.length ? filteredSubItems : undefined,
        }
      })
      .sort((a, b) => a.order - b.order)
      .reduce(
        (acc, item) => {
          if (!acc[item.group]) acc[item.group] = []
          acc[item.group]?.push(item)
          return acc
        },
        {} as Record<string, NavItem[]>
      )
  )
}

interface UseNavItemsReturn {
  navItems: Record<string, NavItem[]>
  isGlobalWorkspace: boolean
  isAdmin: boolean
  isLoading: boolean
}

export const useNavItems = (): UseNavItemsReturn => {
  const { data: session, isPending: isSessionLoading } = authClient.useSession()
  const { data: activeOrganization, isPending: isActiveOrganizationLoading } =
    authClient.useActiveOrganization()

  const isLoading = isSessionLoading || isActiveOrganizationLoading

  if (isLoading || !session || !activeOrganization) {
    return {
      navItems: {},
      isGlobalWorkspace: false,
      isAdmin: false,
      isLoading: true,
    }
  }

  const isGlobalWorkspace = activeOrganization.slug === "global"
  const isAdmin =
    session.user.role === "admin" || session.user.role === "superAdmin"
  const navItems = getNavItems(
    session.user.role as SystemRole,
    isGlobalWorkspace
  )

  return {
    navItems,
    isGlobalWorkspace,
    isAdmin,
    isLoading: false,
  }
}
