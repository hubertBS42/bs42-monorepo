import { createAuth } from "@bs42/auth/server"
export const auth = createAuth(process.env.NEXT_PUBLIC_ADMIN_URL!)
export type Session = typeof auth.$Infer.Session
