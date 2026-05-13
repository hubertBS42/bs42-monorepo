import { CategoryForSelect } from "@/types"
import { formatError } from "@bs42/auth/server"
import { prisma } from "@bs42/db"
import { Category } from "@bs42/db/client"
import { DataResponse } from "@bs42/types"
import { isUUID } from "validator"

export const getCategoriesForTable = async (): Promise<DataResponse<Category[]>> => {
  try {
    const categories = await prisma.category.findMany()

    return {
      success: true,
      data: categories,
    }
  } catch (error) {
    console.error("[getCategoriesError:", error)
    return { success: false, error: formatError(error) }
  }
}

export const getCategoriesForSelect = async (): Promise<DataResponse<CategoryForSelect[]>> => {
  try {
    const categories = await prisma.category.findMany({
      select: { id: true, name: true, parentId: true },
    })

    return {
      success: true,
      data: categories,
    }
  } catch (error) {
    console.error("[getCategoriesError:", error)
    return { success: false, error: formatError(error) }
  }
}

export const getCategoryById = async (categoryId: string): Promise<DataResponse<Category>> => {
  try {
    if (!categoryId || !isUUID(categoryId)) throw new Error("Missing or invalid category ID.")

    const category = await prisma.category.findFirst({
      where: { id: categoryId },
    })

    if (!category) return { success: false, error: "Category not found" }

    return { success: true, data: category }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}
