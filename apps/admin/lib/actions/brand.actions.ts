"use server"
import z from "zod"
import { addBrandFormSchema, updateBrandFormSchema } from "../zod"
import { prisma } from "@bs42/db"
import { formatError } from "@bs42/auth/server"
import { isUUID } from "validator"
import { ActionResponse } from "@bs42/types"

export async function createBrandAction(data: z.infer<typeof addBrandFormSchema>): Promise<ActionResponse> {
  try {
    const validatedData = addBrandFormSchema.parse(data)

    await prisma.brand.create({
      data: { ...validatedData, slug: "" },
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}

export async function updateBrandAction(data: z.infer<typeof updateBrandFormSchema>): Promise<ActionResponse> {
  try {
    const validatedData = updateBrandFormSchema.parse(data)

    await prisma.brand.update({
      where: { id: validatedData.id },
      data: validatedData,
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}

export async function deleteBrandAction(brandId: string): Promise<ActionResponse> {
  try {
    if (!brandId || !isUUID(brandId)) return { success: false, error: "Missing or invalid brand ID." }

    await prisma.brand.delete({
      where: { id: brandId },
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}
