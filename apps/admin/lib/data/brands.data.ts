"server-only"
import { BrandForSelect, BrandsData, BrandsFilters } from "@/types"
import { formatError } from "@bs42/auth/server"
import { prisma } from "@bs42/db"
import { Brand } from "@bs42/db/client"
import { DataResponse } from "@bs42/types"
import { isUUID } from "validator"

export const getBrandsForTable = async (filters: BrandsFilters = {}): Promise<DataResponse<BrandsData>> => {
  try {
    const { name, page = 1, pageSize = 10, sort, order } = filters

    const where = {
      ...(name && { name: { contains: name, mode: "insensitive" as const } }),
    }

    const orderBy = sort ? { [sort]: order ?? "asc" } : { name: "asc" as const }

    const [brands, total] = await Promise.all([
      prisma.brand.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.brand.count({ where }),
    ])

    return {
      success: true,
      data: {
        data: brands,
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

export const getBrandsForSelect = async (): Promise<DataResponse<BrandForSelect[]>> => {
  try {
    const brands = await prisma.brand.findMany({
      select: { id: true, name: true },
    })

    return {
      success: true,
      data: brands,
    }
  } catch (error) {
    console.error("[getCategoriesError:", error)
    return { success: false, error: formatError(error) }
  }
}

export const getBrandById = async (brandId: string): Promise<DataResponse<Brand>> => {
  try {
    if (!brandId || !isUUID(brandId)) return { success: false, error: "Missing or invalid category ID." }

    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    })

    if (!brand) return { success: false, error: "Brand not found" }

    return { success: true, data: brand }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}
