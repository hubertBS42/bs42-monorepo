import { createAuth } from "@bs42/auth"
export const auth = createAuth(process.env.NEXT_PUBLIC_STORE_URL!)
