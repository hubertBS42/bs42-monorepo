import { createAccessControl } from "better-auth/plugins/access"
import { defaultStatements, adminAc, memberAc, ownerAc } from "better-auth/plugins/organization/access"

const statement = {
  ...defaultStatements,
  member: [...defaultStatements.member, "set-role"],
  listing: ["create", "update", "delete"],
} as const

export const storeAccessController = createAccessControl(statement)

export const storeRoles = {
  owner: storeAccessController.newRole({
    ...ownerAc.statements,
    member: [...ownerAc.statements.member, "set-role"],
    listing: ["create", "update", "delete"],
  }),

  admin: storeAccessController.newRole({
    ...adminAc.statements,
    member: [...adminAc.statements.member, "set-role"],
    listing: ["create", "update", "delete"],
  }),
  member: storeAccessController.newRole({
    ...memberAc.statements,
    listing: ["create", "update"],
  }),
}

// Create the OrganizationLevelRole type from the keys
export type StoreRole = keyof typeof storeRoles

// Create a literal tuple of role names
export const STORE_ROLE_NAMES = Object.keys(storeRoles) as [StoreRole, ...Array<StoreRole>]
