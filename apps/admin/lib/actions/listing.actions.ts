"use server"
import { prisma } from "@bs42/db"
import { formatError } from "@bs42/auth/server"
import { ActionResponse } from "@bs42/types"
import { isUUID } from "validator"
import { z } from "zod"
import { addListingFormSchema, updateListingFormSchema } from "../zod"
import { headers } from "next/headers"
import { auth } from "../auth"

export async function createListingAction(data: z.infer<typeof addListingFormSchema>): Promise<ActionResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return { success: false, error: "Unauthorized" }

    const activeStoreId = session.session.activeOrganizationId
    if (!activeStoreId) return { success: false, error: "No active store" }

    const validatedData = addListingFormSchema.parse(data)

    const { productId, sellPrice, buyPrice, compareAtPrice, stock, lowStockThreshold, trackInventory, status, isFeatured, variants } = validatedData

    await prisma.$transaction(async (tx) => {
      const listing = await tx.storeListing.create({
        data: {
          organizationId: activeStoreId,
          productId,
          sellPrice,
          buyPrice: buyPrice || null,
          compareAtPrice: compareAtPrice || null,
          stock,
          lowStockThreshold,
          trackInventory,
          status,
          isFeatured,
        },
      })

      if (variants?.length) {
        await tx.storeListingVariant.createMany({
          data: variants.map((v) => ({
            storeListingId: listing.id,
            variantId: v.variantId,
            sellPrice: v.sellPrice || null,
            buyPrice: v.buyPrice || null,
            compareAtPrice: v.compareAtPrice || null,
            stock: v.stock,
            lowStockThreshold: v.lowStockThreshold,
            trackInventory: v.trackInventory,
            status: v.status,
          })),
        })
      }

      return listing
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}

export async function updateListingAction(data: z.infer<typeof updateListingFormSchema>): Promise<ActionResponse> {
  try {
    const validatedData = updateListingFormSchema.parse(data)

    const { id, sellPrice, buyPrice, compareAtPrice, stock, lowStockThreshold, trackInventory, status, isFeatured, variants } = validatedData

    await prisma.$transaction(async (tx) => {
      await tx.storeListing.update({
        where: { id },
        data: {
          sellPrice,
          buyPrice: buyPrice || null,
          compareAtPrice: compareAtPrice || null,
          stock,
          lowStockThreshold,
          trackInventory,
          status,
          isFeatured,
        },
      })

      if (variants?.length) {
        for (const v of variants) {
          await tx.storeListingVariant.upsert({
            where: { storeListingId_variantId: { storeListingId: id, variantId: v.variantId } },
            create: {
              storeListingId: id,
              variantId: v.variantId,
              sellPrice: v.sellPrice || null,
              buyPrice: v.buyPrice || null,
              compareAtPrice: v.compareAtPrice || null,
              stock: v.stock,
              lowStockThreshold: v.lowStockThreshold,
              trackInventory: v.trackInventory,
              status: v.status,
            },
            update: {
              sellPrice: v.sellPrice || null,
              buyPrice: v.buyPrice || null,
              compareAtPrice: v.compareAtPrice || null,
              stock: v.stock,
              lowStockThreshold: v.lowStockThreshold,
              trackInventory: v.trackInventory,
              status: v.status,
            },
          })
        }
      }
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}

export async function deleteListingAction(listingId: string): Promise<ActionResponse> {
  try {
    if (!listingId || !isUUID(listingId)) return { success: false, error: "Missing or invalid listing ID." }

    await prisma.storeListing.delete({ where: { id: listingId } })

    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}
