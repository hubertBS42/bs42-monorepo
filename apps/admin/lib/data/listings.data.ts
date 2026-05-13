"server-only"
import { prisma } from "@bs42/db"
import { formatError } from "@bs42/auth/server"
import { DataResponse } from "@bs42/types"
import { isUUID } from "validator"
import { Prisma } from "@bs42/db/client"
import { ListingsData, ListingsFilters, ListingDetails } from "@/types"
import { auth } from "../auth"
import { headers } from "next/headers"

export const getStoreListings = async (filters: ListingsFilters = {}): Promise<DataResponse<ListingsData>> => {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return { success: false, error: "Unauthorized" }

    const activeStoreId = session.session.activeOrganizationId
    if (!activeStoreId) return { success: false, error: "No active store" }

    const { name, page = 1, pageSize = 10, sort, order } = filters

    const where: Prisma.StoreListingWhereInput = {
      organizationId: activeStoreId,
      ...(name && {
        product: { name: { contains: name, mode: "insensitive" } },
      }),
    }

    const orderBy = sort ? { [sort]: order ?? "asc" } : { createdAt: "desc" as const }

    const [listings, total] = await Promise.all([
      prisma.storeListing.findMany({
        where,
        include: {
          product: {
            include: {
              brand: true,
              categories: true,
            },
          },
          storeListingVariants: {
            include: {
              variant: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.storeListing.count({ where }),
    ])

    return {
      success: true,
      data: {
        data: listings,
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

export const getStoreListingById = async (listingId: string): Promise<DataResponse<ListingDetails>> => {
  try {
    if (!listingId || !isUUID(listingId)) return { success: false, error: "Missing or invalid listing ID." }

    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return { success: false, error: "Unauthorized" }

    const activeStoreId = session.session.activeOrganizationId
    if (!activeStoreId) return { success: false, error: "No active store" }

    const listing = await prisma.storeListing.findUnique({
      where: { id: listingId, organizationId: activeStoreId },
      include: {
        product: {
          include: {
            brand: true,
            categories: true,
            variants: {
              include: {
                variantValues: {
                  include: {
                    optionValue: {
                      include: { option: true },
                    },
                  },
                },
              },
            },
          },
        },
        storeListingVariants: {
          include: { variant: true },
        },
      },
    })

    if (!listing) return { success: false, error: "Listing not found" }

    return { success: true, data: listing }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}
