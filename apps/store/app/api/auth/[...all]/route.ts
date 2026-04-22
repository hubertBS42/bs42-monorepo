import { auth } from "@/lib/auth"
import { toNextJsHandler } from "@bs42/auth"

export const { GET, POST } = toNextJsHandler(auth)
