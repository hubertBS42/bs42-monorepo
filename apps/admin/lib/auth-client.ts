import { createClient } from "@bs42/auth"
export const authClient = createClient(process.env.NEXT_PUBLIC_ADMIN_URL!)
