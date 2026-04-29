"use client"

import SelectField from "@bs42/ui/components/select-field"
import { MemberWithUserWithSessions, UserWithSessions } from "@/types"
import { authClient } from "@/lib/auth-client"
import { StoreRole } from "@bs42/auth"
import { SystemRole } from "@bs42/auth"
import { capitalizeFirstLetter } from "@bs42/utils"
import { Control, FieldValues, Path } from "react-hook-form"
import { PrimitiveOption, SelectOption } from "@bs42/types"

interface RoleSelectorProps<T extends FieldValues> {
  control: Control<T>
  isPending: boolean
  user?: UserWithSessions | MemberWithUserWithSessions
  options: PrimitiveOption[] | SelectOption[]
  name?: string
  label?: string
  placeholder?: string
  isDisabled?: boolean
  permissionType?: "system" | "store"
}

const RoleSelector = <T extends FieldValues>({
  control,
  isPending,
  user,
  options,
  name = "role",
  label = "Role",
  placeholder,
  isDisabled = false,
  permissionType = "system",
}: RoleSelectorProps<T>) => {
  const getUserId = (
    user?: UserWithSessions | MemberWithUserWithSessions
  ): string | undefined => {
    if (!user) return undefined
    if ("user" in user) return user.user.id
    return user.id
  }

  const getUserRole = (
    user?: UserWithSessions | MemberWithUserWithSessions
  ): string | undefined => {
    if (!user) return undefined
    if ("user" in user) return user.role
    return user.role
  }

  const { data, isPending: isSessionLoading } = authClient.useSession()
  const { data: activeStore, isPending: isActiveStoreLoading } =
    authClient.useActiveOrganization()

  const canSetSystemRole = authClient.admin.checkRolePermission({
    role: data?.user.role as SystemRole,
    permissions: {
      user: ["set-role"],
    },
  })

  const currentMember = activeStore?.members?.find(
    (member) => member.userId === data?.user.id
  )

  const canSetStoreRole = authClient.organization.checkRolePermission({
    role: (currentMember?.role ?? "member") as StoreRole,
    permissions: {
      member: ["set-role"],
    },
  })

  const canSetRole =
    permissionType === "store" ? canSetStoreRole : canSetSystemRole

  const isCurrentUser = data?.session
    ? getUserId(user) === data.session.userId
    : false

  const resolvedPlaceholder = placeholder ?? getUserRole(user) ?? "admin"

  const isLoading =
    isSessionLoading || (permissionType === "store" && isActiveStoreLoading)

  return (
    <div className="col-span-2 grid lg:col-span-1">
      <SelectField
        control={control}
        name={name as Path<T>}
        label={label}
        options={options}
        disabled={
          isDisabled || isLoading || isPending || isCurrentUser || !canSetRole
        }
        loadingPlaceholder={capitalizeFirstLetter(resolvedPlaceholder)}
      />
    </div>
  )
}

export default RoleSelector
