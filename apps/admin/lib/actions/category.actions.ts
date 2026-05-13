"use server"

import z from "zod"
import { addCategoryFormSchema, updateCategoryFormSchema } from "../zod"
import { prisma } from "@bs42/db"
import { formatError } from "@bs42/auth/server"
import { isUUID } from "validator"
import { ActionResponse } from "@bs42/types"

export async function createCategoryAction(data: z.infer<typeof addCategoryFormSchema>): Promise<ActionResponse> {
  try {
    const validatedData = addCategoryFormSchema.parse(data)

    await prisma.category.create({
      data: { ...validatedData, slug: "" },
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}

export async function updateCategoryAction(data: z.infer<typeof updateCategoryFormSchema>): Promise<ActionResponse> {
  try {
    const validatedData = updateCategoryFormSchema.parse(data)

    await prisma.category.update({
      where: { id: validatedData.id },
      data: validatedData,
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}

export async function deleteCategoryAction(categoryId: string): Promise<ActionResponse> {
  try {
    if (!categoryId || !isUUID(categoryId)) return { success: false, error: "Missing or invalid category ID." }

    await prisma.category.delete({
      where: { id: categoryId },
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}
