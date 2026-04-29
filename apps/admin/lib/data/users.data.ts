"server-only"
import { prisma } from "@bs42/db"
import { headers } from "next/headers"
import { getAllowedRoles, SystemRole } from "@bs42/auth"
import { auth } from "../auth"
import { formatError } from "@bs42/auth/server"
import {
  UsersData,
  UsersFilters,
  UserWithSessionsAndMemberships,
} from "@/types"
import { DataResponse } from "@bs42/types"

export const fetchAllUsers = async (
  filters: UsersFilters = {}
): Promise<DataResponse<UsersData>> => {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return { success: false, error: "Unauthorized" }

    const { role } = session.user
    const isPlatformStaff = role === "superAdmin" || role === "admin"
    if (!isPlatformStaff) return { success: false, error: "Forbidden" }

    const { name, page = 1, pageSize = 10, sort, order } = filters

    const allowedRoles = getAllowedRoles(role as SystemRole)

    const where = {
      role: { in: allowedRoles },
      ...(name && { name: { contains: name, mode: "insensitive" as const } }),
    }

    const orderBy = sort ? { [sort]: order ?? "asc" } : { name: "asc" as const }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ])

    return {
      success: true,
      data: {
        data: users,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}

export const getUserById = async (
  userId: string
): Promise<DataResponse<UserWithSessionsAndMemberships | null>> => {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return { success: false, error: "Unauthorized" }

    const { role } = session.user
    const isPlatformStaff = role === "superAdmin" || role === "admin"
    if (!isPlatformStaff) return { success: false, error: "Forbidden" }

    const allowedRoles = getAllowedRoles(role as SystemRole)

    const user = await prisma.user.findUnique({
      where: { id: userId, role: { in: allowedRoles } },
      include: {
        sessions: { orderBy: { createdAt: "desc" } },
        members: {
          include: { organization: true },
        },
      },
    })

    if (!user) return { success: false, error: "User not found" }

    return { success: true, data: user }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}
