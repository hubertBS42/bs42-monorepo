"use server"

import { auth, type Session } from "@/lib/auth"
import { headers } from "next/headers"
import { StoreRole } from "@bs42/auth"
import { formatError } from "@bs42/auth/server"
import { prisma } from "@bs42/db"
import { redirect } from "next/navigation"

export async function addStoreMemberAction({
  userId,
  storeId,
  role,
  session,
}: {
  userId: string
  storeId: string
  role: StoreRole
  session?: Session
}) {
  try {
    const headersObj = await headers()

    // Use provided session or fetch it
    const sessionData =
      session ?? (await auth.api.getSession({ headers: headersObj }))
    if (!sessionData) return { success: false, error: "Unauthorized" }

    // Fetch store and user in parallel
    const [store, user] = await Promise.all([
      prisma.organization.findUnique({
        where: { id: storeId },
        select: { id: true, name: true },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true },
      }),
    ])

    if (!store) return { success: false, error: "Store not found" }
    if (!user) return { success: false, error: "User not found" }

    await auth.api.addMember({
      body: {
        userId,
        role,
        organizationId: storeId,
      },
      headers: headersObj,
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}

export async function removeStoreMemberAction({
  memberId,
  storeId,
  session,
}: {
  memberId: string
  storeId: string
  session?: Session
}) {
  try {
    const headersObj = await headers()

    // Use provided session or fetch it
    const sessionData =
      session ?? (await auth.api.getSession({ headers: headersObj }))
    if (!sessionData) return { success: false, error: "Unauthorized" }

    await auth.api.removeMember({
      body: {
        memberIdOrEmail: memberId,
        organizationId: storeId,
      },
      headers: headersObj,
    })
  } catch (error) {
    return { success: false, error: formatError(error) }
  }

  redirect("/store/members?success=Member+removed+successfully")
}

export async function updateStoreMemberRoleAction({
  memberId,
  storeId,
  role,
  session,
}: {
  memberId: string
  storeId: string
  role: string
  session?: Session
}) {
  try {
    const headersObj = await headers()

    // Use provided session or fetch it
    const sessionData =
      session ?? (await auth.api.getSession({ headers: headersObj }))
    if (!sessionData) return { success: false, error: "Unauthorized" }

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        user: { select: { id: true, name: true } },
        organization: { select: { id: true, name: true } },
      },
    })

    if (!member) return { success: false, error: "Member not found" }

    await auth.api.updateMemberRole({
      body: {
        memberId,
        role,
        organizationId: storeId,
      },

      headers: headersObj,
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}

export async function leaveStoreAction({
  storeId,
  session,
}: {
  storeId: string
  session?: Session
}) {
  try {
    const headersObj = await headers()

    // Use provided session or fetch it
    const sessionData =
      session ?? (await auth.api.getSession({ headers: headersObj }))
    if (!sessionData) return { success: false, error: "Unauthorized" }

    const store = await prisma.organization.findUnique({
      where: { id: storeId },
      select: { name: true },
    })

    if (!store) return { success: false, error: "Store not found" }

    await auth.api.leaveOrganization({
      body: {
        organizationId: storeId,
      },
      headers: headersObj,
    })
  } catch (error) {
    return { success: false, error: formatError(error) }
  }

  redirect("/removed-from-store?success=You+have+left+the+store")
}
