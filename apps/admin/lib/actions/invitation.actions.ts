"use server"

import { headers } from "next/headers"
import { auth, Session } from "../auth"
import { StoreRole } from "@bs42/auth"
import { formatError } from "@bs42/auth/server"
import { prisma } from "@bs42/db"

export async function inviteMemberAction({
  email,
  role,
  session,
}: {
  email: string
  role: StoreRole
  session?: Session
}) {
  try {
    const headersObj = await headers()

    // Use provided session or fetch it
    const sessionData =
      session ?? (await auth.api.getSession({ headers: headersObj }))
    if (!sessionData) return { success: false, error: "Unauthorized" }

    const activeStoreId = sessionData.session.activeOrganizationId
    if (!activeStoreId) return { success: false, error: "No active store" }

    await auth.api.createInvitation({
      body: {
        email,
        role,
        organizationId: activeStoreId,
      },
      headers: headersObj,
    })

    const store = prisma.organization.findUnique({
      where: { id: activeStoreId },
      select: { name: true },
    })

    if (!store) return { success: false, error: "Store not found" }

    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}

export async function acceptInvitationAction({
  invitationId,
  session,
}: {
  invitationId: string
  session?: Session
}) {
  try {
    const headersObj = await headers()

    // Use provided session or fetch it
    const sessionData =
      session ?? (await auth.api.getSession({ headers: headersObj }))
    if (!sessionData) return { success: false, error: "Unauthorized" }

    await auth.api.acceptInvitation({
      body: {
        invitationId,
      },
      headers: headersObj,
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}

export async function rejectInvitationAction({
  invitationId,
  session,
}: {
  invitationId: string
  session?: Session
}) {
  try {
    const headersObj = await headers()

    // Use provided session or fetch it
    const sessionData =
      session ?? (await auth.api.getSession({ headers: headersObj }))
    if (!sessionData) return { success: false, error: "Unauthorized" }

    await auth.api.rejectInvitation({
      body: {
        invitationId,
      },
      headers: headersObj,
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}

export async function cancelInvitationAction(invitationId: string) {
  try {
    const headersObj = await headers()
    const session = await auth.api.getSession({ headers: headersObj })
    if (!session) return { success: false, error: "Unauthorized" }

    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
      include: { organization: { select: { id: true, name: true } } },
    })

    if (!invitation) return { success: false, error: "Invitation not found" }

    await auth.api.cancelInvitation({
      body: { invitationId },
      headers: headersObj,
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}

export async function resendInvitationAction(invitationId: string) {
  try {
    const headersObj = await headers()
    const session = await auth.api.getSession({ headers: headersObj })
    if (!session) return { success: false, error: "Unauthorized" }

    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
      include: { organization: { select: { id: true, name: true } } },
    })

    if (!invitation) return { success: false, error: "Invitation not found" }

    // Cancel existing and create a new one
    await auth.api.cancelInvitation({
      body: { invitationId },
      headers: headersObj,
    })

    await auth.api.createInvitation({
      body: {
        email: invitation.email,
        role: invitation.role as StoreRole,
        organizationId: invitation.organizationId,
      },
      headers: headersObj,
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}
