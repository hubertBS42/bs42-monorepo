import { createClient } from "@bs42/auth"

export const authClient: ReturnType<typeof createClient> = createClient(
  process.env.NEXT_PUBLIC_ADMIN_URL!
)
