"server-only"
import { Store, StoresData, StoresFilters } from "@/types"
import { formatError } from "@bs42/auth/server"
import { auth } from "../auth"
import { headers } from "next/headers"
import { prisma } from "@bs42/db"
import { DataResponse } from "@bs42/types"

export const fetchStores = async (
  filters: StoresFilters = {}
): Promise<DataResponse<StoresData>> => {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return { success: false, error: "Unauthorized" }

    const { name, page = 1, pageSize = 10, sort, order } = filters

    const { role } = session.user
    const isSystemAdmin = role === "superAdmin" || role === "admin"

    const where = {
      ...(isSystemAdmin
        ? { slug: { not: "global" } }
        : { members: { some: { userId: session.user.id } } }),
      ...(name && { name: { contains: name, mode: "insensitive" as const } }),
    }

    const orderBy = sort ? { [sort]: order ?? "asc" } : { name: "asc" as const }

    const [stores, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.organization.count({ where }),
    ])

    return {
      success: true,
      data: {
        data: stores,
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

export const getStoreById = async (
  storeId: string
): Promise<DataResponse<Store | null>> => {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return { success: false, error: "Unauthorized" }

    const { role } = session.user
    const isSystemAdmin = role === "superAdmin" || role === "admin"

    if (!isSystemAdmin) return { success: false, error: "Forbidden" }

    const store = await prisma.organization.findUnique({
      where: { id: storeId },
    })

    if (!store) return { success: false, error: "Store not found" }

    return { success: true, data: store }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}
