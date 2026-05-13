"server-only"
import { ProductsData, ProductsFilters, ProductDetails } from "@/types"
import { formatError } from "@bs42/auth/server"
import { prisma } from "@bs42/db"
import { DataResponse } from "@bs42/types"
import { isUUID } from "validator"

export const getAllProducts = async (filters: ProductsFilters = {}): Promise<DataResponse<ProductsData>> => {
  try {
    const { name, page = 1, pageSize = 10, sort, order } = filters

    const where = {
      ...(name && { name: { contains: name, mode: "insensitive" as const } }),
    }

    const orderBy = sort ? { [sort]: order ?? "asc" } : { name: "asc" as const }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { brand: true, categories: true },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ])

    return {
      success: true,
      data: {
        data: products,
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

export const getProductById = async (productId: string): Promise<DataResponse<ProductDetails>> => {
  try {
    if (!productId || !isUUID(productId)) return { success: false, error: "Missing or invalid product ID." }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
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
        variantOptions: {
          include: { values: true },
        },
        categories: true,
        documents: true,
        brand: true,
      },
    })

    if (!product) return { success: false, error: "Product not found" }

    return { success: true, data: product }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}
