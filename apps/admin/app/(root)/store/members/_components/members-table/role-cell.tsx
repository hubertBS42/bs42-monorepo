"use client"

import { Badge } from "@bs42/ui/components/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@bs42/ui/components/select"
import { Skeleton } from "@bs42/ui/components/skeleton"
import { MemberWithUser } from "@/types"
import { updateStoreMemberRoleAction } from "@/lib/actions/member.actions"
import { authClient } from "@/lib/auth-client"
import { STORE_ROLE_NAMES, StoreRole } from "@bs42/auth"
import { capitalizeFirstLetter } from "@bs42/utils"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "@bs42/ui/components/sonner"

export const RollCellSkeleton = () => {
  return <Skeleton className="h-8 w-32 rounded-md" />
}

const genRoleBadge = (role: StoreRole) => {
  const roleConfig = {
    owner: { variant: "default" as const, className: "" },
    admin: { variant: "secondary" as const, className: "" },
    member: { variant: "outline" as const, className: "" },
  }

  const config = roleConfig[role] || roleConfig.member
  return <Badge variant={config.variant}>{capitalizeFirstLetter(role)}</Badge>
}

const RoleCell = ({ member }: { member: MemberWithUser }) => {
  const [isPending, startTransition] = useTransition()
  const { data: activeOrganization, isPending: isActiveOrgLoading } =
    authClient.useActiveOrganization()
  const { data: session, isPending: isSessionLoading } = authClient.useSession()
  const router = useRouter()

  if (isActiveOrgLoading || isSessionLoading) {
    return <RollCellSkeleton />
  }

  const currentMember = activeOrganization?.members?.find(
    (m) => m.userId === session?.user.id
  )

  const canSetRole = authClient.organization.checkRolePermission({
    role: (currentMember?.role ?? "member") as StoreRole,
    permissions: { member: ["set-role"] },
  })

  const isCurrentMember = member.user.id === session?.user.id
  const isOwner = member.role === "owner"

  // Always show badge for owners, current member, or users without permission
  if (isOwner || isCurrentMember || !canSetRole) {
    return genRoleBadge(member.role as StoreRole)
  }

  const handleRoleChange = (role: string) => {
    startTransition(async () => {
      const response = await updateStoreMemberRoleAction({
        memberId: member.id,
        role,
        storeId: member.organizationId,
      })

      if (!response.success) {
        toast.error("Operation failed", { description: response.error })
        return
      }

      toast.success("Operation success", {
        description: "Member's role has been updated successfully!",
      })
      router.refresh()
    })
  }

  return (
    <Select
      defaultValue={member.role}
      onValueChange={handleRoleChange}
      disabled={isPending}
    >
      <SelectTrigger className="h-8 w-32" size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {STORE_ROLE_NAMES.filter((role) => role !== "owner").map((role) => (
          <SelectItem key={role} value={role}>
            {capitalizeFirstLetter(role)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default RoleCell
