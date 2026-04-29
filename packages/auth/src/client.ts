import {
  adminClient,
  inferOrgAdditionalFields,
  organizationClient,
} from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import { systemAccessController, systemRoles } from "./system-permissions"
import { storeAccessController, storeRoles } from "./store-permissions"
import { createAuth } from "./auth"

type AuthInstance = ReturnType<typeof createAuth>

export function createClient(baseURL: string) {
  return createAuthClient({
    baseURL,
    plugins: [
      adminClient({
        ac: systemAccessController,
        roles: systemRoles,
      }),
      organizationClient({
        ac: storeAccessController,
        roles: storeRoles,
        schema: inferOrgAdditionalFields<AuthInstance>(),
      }),
    ],
  })
}
