"use server"
import { headers } from "next/headers"
import { auth, type Session } from "../auth"
import { StoreRole, SystemRole } from "@bs42/auth"
import { formatError } from "@bs42/auth/server"
import { prisma } from "@bs42/db"
import { User } from "@bs42/db/client"
import {
  addStoreMemberAction,
  removeStoreMemberAction,
  updateStoreMemberRoleAction,
} from "./member.actions"
import { redirect } from "next/navigation"

async function addUserToAllStores({
  userId,
  systemRole,
}: {
  userId: string
  systemRole: SystemRole
}) {
  try {
    const stores = await prisma.organization.findMany({
      select: { id: true, name: true },
    })

    await prisma.member.createMany({
      data: stores.map((store) => ({
        userId,
        organizationId: store.id,
        role: systemRole === "superAdmin" ? "owner" : "admin",
      })),
      skipDuplicates: true,
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}

export async function createUserAction({
  name,
  email,
  image,
  password,
  systemRole,
  stores,
}: {
  name: string
  email: string
  image: string | undefined
  password: string
  systemRole: SystemRole
  stores?: { storeId: string; storeRole: StoreRole }[]
}) {
  try {
    const headersObj = await headers()
    const session = await auth.api.getSession({ headers: headersObj })
    if (!session) return { success: false, error: "Unauthorized" }

    const { role: sessionRole } = session.user
    if (sessionRole !== "superAdmin" && sessionRole !== "admin") {
      return { success: false, error: "Forbidden" }
    }

    // Create user via better-auth admin API
    const newUser = await auth.api.createUser({
      body: { name, email, password, role: systemRole, data: { image } },
      headers: headersObj,
    })

    // Request password reset
    await auth.api.requestPasswordReset({
      body: { email, redirectTo: "/set-password?action=set" },
      headers: headersObj,
    })

    // Add to stores
    if (systemRole === "user" && stores?.length) {
      // Add members
      await Promise.all(
        stores.map(({ storeId, storeRole }) =>
          addStoreMemberAction({
            userId: newUser.user.id,
            storeId,
            role: storeRole,
            session,
          })
        )
      )
    }

    if (systemRole === "superAdmin" || systemRole === "admin") {
      await addUserToAllStores({ userId: newUser.user.id, systemRole })
    }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }

  redirect("/users?success=User+added+successfully")
}

async function updateOrgMembershipsAction({
  userId,
  stores,
  removedMembers,
  session,
}: {
  userId: string
  stores: {
    memberId?: string
    storeId: string
    storeRole: StoreRole
    isNew: boolean
  }[]
  removedMembers: { memberId: string; storeId: string }[]
  session: Session
}) {
  try {
    await Promise.all([
      // Add new memberships
      ...stores
        .filter((store) => store.isNew)
        .map(async ({ storeRole, storeId }) =>
          addStoreMemberAction({
            userId,
            storeId,
            role: storeRole,
            session,
          })
        ),

      // Update memberships whose role changed
      ...stores
        .filter((store) => !store.isNew && store.memberId)
        .map(async ({ memberId, storeRole, storeId }) => {
          const existingMembership = await prisma.member.findUnique({
            where: { id: memberId },
          })
          if (existingMembership?.role !== storeRole)
            return updateStoreMemberRoleAction({
              memberId: memberId ?? "",
              role: storeRole,
              storeId,
              session,
            })
        }),

      // Remove deleted memberships
      ...removedMembers.map(async ({ memberId, storeId }) =>
        removeStoreMemberAction({ memberId, storeId, session })
      ),
    ])

    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}

export async function updateUserAction({
  id,
  name,
  email,
  image,
  stores,
  removedMembers,
}: {
  id: string
  name: string
  email: string
  image: string | undefined
  stores?: {
    memberId?: string
    storeId: string
    storeRole: StoreRole
    isNew: boolean
  }[]
  removedMembers?: { memberId: string; storeId: string }[]
}) {
  try {
    const headersObj = await headers()
    const session = await auth.api.getSession({ headers: headersObj })
    if (!session) return { success: false, error: "Unauthorized" }

    const { role: sessionRole } = session.user
    if (sessionRole !== "superAdmin" && sessionRole !== "admin") {
      return { success: false, error: "Forbidden" }
    }

    await auth.api.adminUpdateUser({
      body: {
        userId: id,
        data: { name, email, image },
      },
      headers: headersObj,
    })

    if (stores?.length || removedMembers?.length) {
      await updateOrgMembershipsAction({
        userId: id,
        stores: stores ?? [],
        removedMembers: removedMembers ?? [],
        session,
      })
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}

export async function banUserAction(data: {
  userId: string
  banReason: string | null
  banExpiresIn: Date | null
}) {
  try {
    const headersObj = await headers()
    const session = await auth.api.getSession({ headers: headersObj })
    if (!session) return { success: false, error: "Unauthorized" }

    const { role: sessionRole } = session.user
    if (sessionRole !== "superAdmin" && sessionRole !== "admin") {
      return { success: false, error: "Forbidden" }
    }

    let banExpiresIn: number | undefined = undefined

    if (data.banExpiresIn) {
      const now = Date.now() // current time in ms
      banExpiresIn = Math.floor((data.banExpiresIn.getTime() - now) / 1000)
    }

    await auth.api.banUser({
      body: {
        userId: data.userId,
        banExpiresIn,
        banReason: data?.banReason ?? undefined,
      },
      headers: headersObj,
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}

export async function unbanUserAction(userId: string) {
  try {
    const headersObj = await headers()
    const session = await auth.api.getSession({ headers: headersObj })
    if (!session) return { success: false, error: "Unauthorized" }

    const { role: sessionRole } = session.user
    if (sessionRole !== "superAdmin" && sessionRole !== "admin") {
      return { success: false, error: "Forbidden" }
    }

    await auth.api.unbanUser({
      body: {
        userId,
      },
      headers: headersObj,
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}

export async function deleteUserAction(user: User) {
  try {
    const headersObj = await headers()
    const session = await auth.api.getSession({ headers: headersObj })
    if (!session) return { success: false, error: "Unauthorized" }

    const { role: sessionRole } = session.user
    if (sessionRole !== "superAdmin" && sessionRole !== "admin") {
      return { success: false, error: "Forbidden" }
    }

    // Memberships are cascade deleted by better-auth
    await auth.api.removeUser({
      body: { userId: user.id },
      headers: headersObj,
    })
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
  redirect("/users?success=User+deleted+successfully")
}

export async function userSignUpAction({
  name,
  email,
  password,
  callbackURL,
}: {
  name: string
  email: string
  password: string
  callbackURL: string
}) {
  try {
    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
        callbackURL,
      },
      headers: await headers(),
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}

export async function requestPasswordResetAction({
  email,
  redirectTo,
  actor,
}: {
  email: string
  redirectTo: string
  actor: "self" | "admin"
}) {
  try {
    const headersObj = await headers()

    if (actor === "admin") {
      const session = await auth.api.getSession({ headers: headersObj })
      if (!session) return { success: false, error: "Unauthorized" }

      const { role: sessionRole } = session.user
      if (sessionRole !== "superAdmin" && sessionRole !== "admin") {
        return { success: false, error: "Forbidden" }
      }
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true },
    })

    if (!user) return { success: false, error: "User not found" }

    await auth.api.requestPasswordReset({
      body: {
        email,
        redirectTo,
      },
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}
