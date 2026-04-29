"server-only"
import {
  MembersData,
  MembersFilters,
  MemberWithUserWithSessions,
} from "@/types"
import { headers } from "next/headers"
import { auth } from "../auth"
import { formatError } from "@bs42/auth/server"
import { prisma } from "@bs42/db"
import { DataResponse } from "@bs42/types"

export const fetchStoreMembers = async (
  filters: MembersFilters = {}
): Promise<DataResponse<MembersData>> => {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return { success: false, error: "Unauthorized" }

    const activeStoreId = session.session.activeOrganizationId
    if (!activeStoreId) return { success: false, error: "No active store" }

    const { name, page = 1, pageSize = 10, sort, order } = filters

    const where = {
      organizationId: activeStoreId,
      user: {
        role: { notIn: ["superAdmin", "admin"] },
        ...(name && { name: { contains: name, mode: "insensitive" as const } }),
      },
    }

    const orderBy = sort
      ? { [sort]: order ?? "asc" }
      : { createdAt: "desc" as const }

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { user: true },
      }),
      prisma.member.count({ where }),
    ])

    return {
      success: true,
      data: {
        data: members,
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

export const getStoreMemberById = async (
  memberId: string
): Promise<DataResponse<MemberWithUserWithSessions | null>> => {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return { success: false, error: "Unauthorized" }

    const activeStoreId = session.session.activeOrganizationId
    if (!activeStoreId) return { success: false, error: "No active store" }

    const member = await prisma.member.findFirst({
      where: {
        id: memberId,
        organizationId: activeStoreId,
        user: {
          role: { notIn: ["superAdmin", "admin"] },
        },
      },
      include: {
        user: {
          include: {
            sessions: { orderBy: { createdAt: "desc" } },
          },
        },
      },
    })

    if (!member) return { success: false, error: "Member not found" }

    return { success: true, data: member }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}
