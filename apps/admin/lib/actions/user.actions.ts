"use server"
import { headers } from "next/headers"
import { auth, type Session } from "../auth"
import { StoreRole, SystemRole } from "@bs42/auth"
import { formatError } from "@bs42/auth/server"
import { prisma } from "@bs42/db"
import { Prisma, User } from "@bs42/db/client"
import { addStoreMemberAction, removeStoreMemberAction, updateStoreMemberRoleAction } from "./member.actions"
import { ActionResponse } from "@bs42/types"
import { isUUID } from "validator"

async function addUserToAllStoresAction({ userId, systemRole }: { userId: string; systemRole: SystemRole }): Promise<ActionResponse> {
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
  phone,
  dob,
  getMarketingEmails,
  getOrderEmails,
  getSecurityEmails,
  password,
  systemRole,
  stores,
}: {
  name: string
  email: string
  image: string | undefined
  phone: string | null
  dob: Date | null
  getMarketingEmails: boolean
  getSecurityEmails: boolean
  getOrderEmails: boolean
  password: string
  systemRole: SystemRole
  stores?: { storeId: string; storeRole: StoreRole }[]
}): Promise<ActionResponse> {
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
      body: { name, email, password, role: systemRole, data: { image, phone, dob, getMarketingEmails, getOrderEmails, getSecurityEmails } },
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
      await addUserToAllStoresAction({ userId: newUser.user.id, systemRole })
    }
    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
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
}): Promise<ActionResponse> {
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
      ...removedMembers.map(async ({ memberId, storeId }) => removeStoreMemberAction({ memberId, storeId, session })),
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
  phone,
  dob,
  image,
  getMarketingEmails,
  getSecurityEmails,
  getOrderEmails,
  stores,
  removedMembers,
}: {
  id: string
  name: string
  email: string
  image: string | undefined
  phone: string | null
  dob: Date | null
  getMarketingEmails: boolean
  getSecurityEmails: boolean
  getOrderEmails: boolean
  stores?: {
    memberId?: string
    storeId: string
    storeRole: StoreRole
    isNew: boolean
  }[]
  removedMembers?: { memberId: string; storeId: string }[]
}): Promise<ActionResponse> {
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
        data: { name, email, image, phone, dob, getMarketingEmails, getSecurityEmails, getOrderEmails },
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

export async function banUserAction(data: { userId: string; banReason: string | null; banExpiresIn: Date | null }): Promise<ActionResponse> {
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

export async function unbanUserAction(userId: string): Promise<ActionResponse> {
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

export async function deleteUserAction(user: User): Promise<ActionResponse> {
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
    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}

export async function userSignUpAction({ name, email, password, callbackURL }: { name: string; email: string; password: string; callbackURL: string }): Promise<ActionResponse> {
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

export async function requestPasswordResetAction({ email, redirectTo, actor }: { email: string; redirectTo: string; actor: "self" | "admin" }): Promise<ActionResponse> {
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

export async function addAddressAction({ userId, data }: { userId: string; data: Prisma.AddressCreateWithoutUserInput }): Promise<ActionResponse> {
  try {
    await prisma.$transaction(async (tx) => {
      const totalAddresses = await tx.address.count({
        where: {
          userId,
        },
      })

      const makeDefault = totalAddresses === 0 || data.isDefault

      // If setting new address as default, unset all others
      if (makeDefault && totalAddresses > 0) {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        })
      }

      await tx.address.create({
        data: {
          name: data.name,
          phone: data.phone,
          user: { connect: { id: userId } },
          line1: data.line1,
          line2: data.line2,
          region: data.region,
          town: data.town,
          isDefault: makeDefault,
          latitude: data.latitude,
          longitude: data.longitude,
        },
      })
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}

export async function updateAddressAction({ userId, data }: { userId: string; data: Prisma.AddressUpdateWithoutUserInput }): Promise<ActionResponse> {
  try {
    await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        // Unset any other default addresses for this user
        await tx.address.updateMany({
          where: {
            userId,
            isDefault: true,
            id: { not: data.id as string },
          },
          data: {
            isDefault: false,
          },
        })
      }

      // Update this address
      await tx.address.update({
        where: {
          id: data.id as string,
        },
        data: {
          name: data.name,
          phone: data.phone,
          user: { connect: { id: userId } },
          line1: data.line1,
          line2: data.line2,
          region: data.region,
          town: data.town,
          isDefault: data.isDefault,
          latitude: data.latitude,
          longitude: data.longitude,
        },
      })
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}

export async function deleteAddressAction(id: string): Promise<ActionResponse> {
  try {
    if (!id || !isUUID(id)) return { success: false, error: "Missing or invalid address ID." }

    // Get the addres being deleted
    const addressToDelete = await prisma.address.findUnique({
      where: { id },
      select: { isDefault: true, userId: true },
    })

    if (!addressToDelete) throw new Error("Address does not exist.")

    await prisma.$transaction(async (tx) => {
      // Delete the address
      await tx.address.delete({
        where: {
          id,
        },
      })

      // If it was the default, assign a new one
      if (addressToDelete.isDefault) {
        const latestAddress = await tx.address.findFirst({
          where: { userId: addressToDelete.userId },
          orderBy: { createdAt: "desc" },
        })

        if (latestAddress) {
          await tx.address.update({
            where: { id: latestAddress.id },
            data: { isDefault: true },
          })
        }
      }
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}
