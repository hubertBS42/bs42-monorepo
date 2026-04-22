import { createAuthClient } from "better-auth/react"

type AuthClient = ReturnType<typeof createAuthClient>

export function createClient(baseURL: string): AuthClient {
  return createAuthClient({ baseURL })
}
