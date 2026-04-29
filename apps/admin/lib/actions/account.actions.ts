"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { formatError } from "@bs42/auth/server"

export async function updateProfileAction({
  name,
  image,
}: {
  name: string
  image: string | undefined
}) {
  try {
    const headersObj = await headers()
    const session = await auth.api.getSession({ headers: headersObj })
    if (!session) return { success: false, error: "Unauthorized" }

    await auth.api.updateUser({
      body: { name, image },
      headers: headersObj,
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}

export async function revokeSessionAction(token: string) {
  try {
    const headersObj = await headers()
    const session = await auth.api.getSession({ headers: headersObj })
    if (!session) return { success: false, error: "Unauthorized" }

    await auth.api.revokeSession({
      body: { token },
      headers: headersObj,
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}

// lib/actions/account.actions.ts
export async function updatePasswordAction({
  currentPassword,
  newPassword,
}: {
  currentPassword: string
  newPassword: string
}) {
  try {
    const headersObj = await headers()
    const session = await auth.api.getSession({ headers: headersObj })
    if (!session) return { success: false, error: "Unauthorized" }

    await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      },
      headers: headersObj,
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}
