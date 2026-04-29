import { auth } from "@/lib/auth"
import { toNextJsHandler } from "@bs42/auth/server"

export const { GET, POST } = toNextJsHandler(auth)
