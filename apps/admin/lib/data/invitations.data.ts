"server-only"

import { InvitationsData, InvitationsFilters } from "@/types"
import { headers } from "next/headers"
import { auth } from "../auth"
import { prisma } from "@bs42/db"
import { formatError } from "@bs42/auth/server"
import { DataResponse } from "@bs42/types"

export const fetchStoreInvitations = async (
  filters: InvitationsFilters = {}
): Promise<DataResponse<InvitationsData>> => {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return { success: false, error: "Unauthorized" }

    const activeStoreId = session.session.activeOrganizationId
    if (!activeStoreId) return { success: false, error: "No active store" }

    const { email, page = 1, pageSize = 10, sort, order } = filters

    const where = {
      ...(email && {
        email: { contains: email, mode: "insensitive" as const },
      }),
      organizationId: activeStoreId,
      status: "pending",
    }

    const orderBy = sort
      ? { [sort]: order ?? "asc" }
      : { createdAt: "desc" as const }

    const [invitations, total] = await Promise.all([
      prisma.invitation.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { inviter: true },
      }),
      prisma.invitation.count({ where }),
    ])

    return {
      success: true,
      data: {
        data: invitations,
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
