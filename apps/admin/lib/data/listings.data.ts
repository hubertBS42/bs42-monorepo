"server-only"
import { prisma } from "@bs42/db"
import { formatError } from "@bs42/auth/server"
import { DataResponse } from "@bs42/types"
import { isUUID } from "validator"
import { Prisma } from "@bs42/db/client"
import { ListingsData, ListingsFilters, ListingDetails, ListingForOrder } from "@/types"
import { auth } from "../auth"
import { headers } from "next/headers"

export const getListingsForTable = async (filters: ListingsFilters = {}): Promise<DataResponse<ListingsData>> => {
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
        select: {
          id: true,
          product: {
            select: {
              name: true,
              images: true,
              brand: {
                select: {
                  name: true,
                },
              },
              hasVariants: true,
              categories: {
                select: { name: true },
              },
            },
          },
          sellPrice: true,
          stock: true,
          isFeatured: true,
          status: true,
          createdAt: true,
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

export const getListingsForOrder = async (): Promise<DataResponse<ListingForOrder[]>> => {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return { success: false, error: "Unauthorized" }

    const activeStoreId = session.session.activeOrganizationId
    if (!activeStoreId) return { success: false, error: "No active store" }

    const where: Prisma.StoreListingWhereInput = {
      organizationId: activeStoreId,
    }

    const listings = await prisma.storeListing.findMany({
      where,
      select: {
        id: true,
        product: {
          select: {
            sku: true,
            name: true,
            brand: {
              select: { name: true },
            },
            hasVariants: true,
            images: true,
          },
        },
        sellPrice: true,
        storeListingVariants: {
          select: {
            id: true,
            sellPrice: true,
            variantId: true,
            variant: {
              select: {
                sku: true,
                variantValues: {
                  select: {
                    optionValue: {
                      select: { option: true, value: true },
                    },
                  },
                },
              },
            },
          },
        },
        organization: {
          select: { name: true },
        },
      },
    })

    return {
      success: true,
      data: listings,
    }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}
export const getListingsForBrowser = async (): Promise<DataResponse<{ product: { id: string } }[]>> => {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return { success: false, error: "Unauthorized" }

    const activeStoreId = session.session.activeOrganizationId
    if (!activeStoreId) return { success: false, error: "No active store" }

    const where: Prisma.StoreListingWhereInput = {
      organizationId: activeStoreId,
    }

    const listings = await prisma.storeListing.findMany({
      where,
      select: {
        product: {
          select: {
            id: true,
          },
        },
      },
    })

    return {
      success: true,
      data: listings,
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
        storeListingVariants: true,
        product: {
          select: {
            name: true,
            brand: { select: { name: true } },
            categories: {
              select: {
                id: true,
                name: true,
              },
            },
            images: true,
            hasVariants: true,
            variants: {
              select: {
                id: true,
                variantValues: {
                  select: {
                    optionValue: {
                      select: {
                        option: {
                          select: { name: true },
                        },
                        value: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!listing) return { success: false, error: "Listing not found" }

    return { success: true, data: listing }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}
