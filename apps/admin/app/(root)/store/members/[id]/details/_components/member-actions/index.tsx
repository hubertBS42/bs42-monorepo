"use client"

import { MemberWithUserWithSessions } from "@/types"
import { authClient } from "@/lib/auth-client"
import RemoveMember from "./remove-member"
import { StoreRole } from "@bs42/auth"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@bs42/ui/components/card"

interface MemberActionsProps {
  member: MemberWithUserWithSessions
}

const MemberActions = ({ member }: MemberActionsProps) => {
  const { data: activeMember } = authClient.useActiveMember()

  const canRemove = authClient.organization.checkRolePermission({
    role: (activeMember?.role ?? "member") as StoreRole,
    permissions: { member: ["delete"] },
  })

  const isCurrentMember = member.id === activeMember?.id

  if (isCurrentMember) return null
  if (!isCurrentMember && !canRemove) return null
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
        <CardDescription>Remove member from store</CardDescription>
      </CardHeader>
      <CardContent>{canRemove && <RemoveMember member={member} />}</CardContent>
    </Card>
  )
}
export default MemberActions
