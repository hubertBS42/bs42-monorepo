import { createAccessControl } from "better-auth/plugins/access"
import {
  defaultStatements,
  adminAc,
  userAc,
} from "better-auth/plugins/admin/access"

const statement = {
  ...defaultStatements,
  organization: ["create", "update", "delete", "switch"],
} as const

export const systemAccessController = createAccessControl(statement)

export const systemRoles = {
  user: systemAccessController.newRole({
    ...userAc.statements,
  }),
  admin: systemAccessController.newRole({
    ...adminAc.statements,
  }),
  superAdmin: systemAccessController.newRole({
    ...adminAc.statements,
  }),
}

// Create the OrganizationLevelRole type from the keys
export type SystemRole = keyof typeof systemRoles

// Create a literal tuple of role names
export const SYSTEM_ROLE_NAMES = Object.keys(systemRoles) as [
  SystemRole,
  ...Array<SystemRole>,
]

export const SYSTEM_ROLE_LEVELS: Record<SystemRole, number> = {
  user: 1,
  admin: 2,
  superAdmin: 3,
}

export const getAllowedRoles = (userRole: SystemRole): string[] => {
  const currentRoleLevel = SYSTEM_ROLE_LEVELS[userRole] ?? -1
  return (
    Object.entries(SYSTEM_ROLE_LEVELS)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, level]) => level <= currentRoleLevel)
      .map(([role]) => role)
  )
}

export const getAllowedSystemAdminRoles = (
  userRole: SystemRole
): SystemRole[] => {
  const currentRoleLevel = SYSTEM_ROLE_LEVELS[userRole] ?? -1
  const staffRoles: SystemRole[] = ["admin", "superAdmin"]

  return staffRoles.filter(
    (role) => SYSTEM_ROLE_LEVELS[role] <= currentRoleLevel
  )
}
