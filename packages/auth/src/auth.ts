import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "@bs42/db"

export function createAuth(baseURL: string) {
  return betterAuth({
    baseURL,
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    emailAndPassword: { enabled: true },
    advanced: {
      crossSubDomainCookies: {
        enabled: true,
        domain: process.env.COOKIE_DOMAIN,
      },
    },
  })
}
