"server-only"
import { prisma } from "@bs42/db"
import { formatError } from "@bs42/auth/server"
import { DataResponse } from "@bs42/types"
import { isUUID } from "validator"
import { Prisma } from "@bs42/db/client"
import { OrdersData, OrdersFilters, OrderDetails } from "@/types"
import { auth } from "../auth"
import { headers } from "next/headers"

export const getOrdersForTable = async (filters: OrdersFilters = {}): Promise<DataResponse<OrdersData>> => {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return { success: false, error: "Unauthorized" }

    const activeStoreId = session.session.activeOrganizationId
    if (!activeStoreId) return { success: false, error: "No active store" }

    const { reference, status, page = 1, pageSize = 10, sort, order } = filters

    const where: Prisma.OrderWhereInput = {
      orderItems: { some: { organizationId: activeStoreId } },
      ...(reference && { reference: { contains: reference, mode: "insensitive" } }),
      ...(status && { status }),
    }

    const orderBy = sort ? { [sort]: order ?? "asc" } : { createdAt: "desc" as const }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderItems: {
            where: { organizationId: activeStoreId },
            include: {
              storeListing: {
                include: { product: { include: { brand: true } } },
              },
              storeListingVariant: {
                include: { variant: true },
              },
              organization: { select: { name: true } },
            },
          },
          statusHistory: {
            orderBy: { createdAt: "desc" },
            include: { changedBy: { select: { name: true } } },
          },
          user: { select: { name: true, email: true, phone: true } },
          createdBy: { select: { name: true } },
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.order.count({ where }),
    ])

    return {
      success: true,
      data: {
        data: orders,
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

export const getAllOrders = async (filters: OrdersFilters = {}): Promise<DataResponse<OrdersData>> => {
  try {
    const { reference, status, page = 1, pageSize = 10, sort, order } = filters

    const where: Prisma.OrderWhereInput = {
      ...(reference && { reference: { contains: reference, mode: "insensitive" } }),
      ...(status && { status }),
    }

    const orderBy = sort ? { [sort]: order ?? "asc" } : { createdAt: "desc" as const }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderItems: {
            include: {
              storeListing: {
                include: { product: { include: { brand: true } } },
              },
              storeListingVariant: {
                include: { variant: true },
              },
              organization: { select: { name: true } },
            },
          },
          statusHistory: {
            orderBy: { createdAt: "desc" },
            include: { changedBy: { select: { name: true } } },
          },
          user: { select: { name: true, email: true, phone: true } },
          createdBy: { select: { name: true } },
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.order.count({ where }),
    ])

    return {
      success: true,
      data: {
        data: orders,
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

export const getOrderById = async (orderId: string): Promise<DataResponse<OrderDetails>> => {
  try {
    if (!orderId || !isUUID(orderId)) return { success: false, error: "Missing or invalid order ID." }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            storeListing: {
              include: { product: { include: { brand: true } } },
            },
            storeListingVariant: {
              include: { variant: true },
            },
            organization: { select: { name: true, slug: true } },
          },
        },
        statusHistory: {
          orderBy: { createdAt: "desc" },
          include: { changedBy: { select: { name: true } } },
        },
        user: { select: { name: true, email: true, phone: true } },
        createdBy: { select: { name: true } },
      },
    })

    if (!order) return { success: false, error: "Order not found" }

    return { success: true, data: order }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}
