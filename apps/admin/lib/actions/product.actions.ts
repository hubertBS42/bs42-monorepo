"use server"
import z from "zod"
import { addProductFormSchema, updateProductFormSchema } from "../zod"
import { prisma } from "@bs42/db"
import { formatError } from "@bs42/auth/server"
import { ActionResponse } from "@bs42/types"
import { isUUID } from "validator"

export async function createProductAction(data: z.infer<typeof addProductFormSchema>): Promise<ActionResponse> {
  try {
    const validatedData = addProductFormSchema.parse(data)

    const { name, description, baseBuyPrice, baseSellPrice, brandId, condition, hasVariants, images, status, variantOptions, variants, categoryIds } = validatedData

    // ============================================
    // SIMPLE PRODUCT (No Variants)
    // ============================================
    if (!hasVariants) {
      await prisma.product.create({
        data: {
          name,
          slug: "", // generated in prisma middleware
          brandId,
          baseSellPrice,
          baseBuyPrice,
          hasVariants: false,
          status,
          condition,
          description,
          tags: validatedData.tags ?? [],
          images,
          sku: validatedData.sku || null,
          barcode: validatedData.barcode || null,
          weight: validatedData.weight || null,
          dimensions: validatedData.dimensions || null,
          categories: {
            connect: categoryIds.map((id) => ({ id })),
          },
          documents: {
            create: validatedData.documents.map((doc) => ({
              name: doc.name,
              url: doc.url,
            })),
          },
        },
      })

      return { success: true }
    }

    // ============================================
    // PRODUCT WITH VARIANTS (OPTIMIZED)
    // ============================================

    // Pre-validation
    if (!variantOptions?.length || !variants?.length) {
      return {
        success: false,
        error: "Variant options and variants are required for products with variants",
      }
    }

    await prisma.$transaction(
      async (tx) => {
        // 1. Create the product
        const product = await tx.product.create({
          data: {
            name,
            slug: "",
            brandId,
            baseSellPrice,
            baseBuyPrice,
            hasVariants: true,
            status,
            condition,
            description,
            images,
            categories: {
              connect: categoryIds.map((id) => ({ id })),
            },
          },
        })

        // 2. Create documents if provided
        if (validatedData.documents?.length) {
          await tx.productDocument.createMany({
            data: validatedData.documents.map((doc) => ({
              productId: product.id,
              name: doc.name,
              url: doc.url,
            })),
          })
        }

        // 3. Create all variant options IN PARALLEL
        const createdOptions = await tx.variantOption.createManyAndReturn({
          data: variantOptions.map((option) => ({
            productId: product.id,
            name: option.name,
            position: option.position,
          })),
        })

        // 4. Create all option values IN PARALLEL (grouped by option)
        const createdValues = await tx.variantOptionValue.createManyAndReturn({
          data: createdOptions.flatMap((createdOption, optionIndex) => {
            const option = variantOptions[optionIndex]
            return option!.values.map((value) => ({
              optionId: createdOption.id,
              value: value.value,
              position: value.position,
            }))
          }),
        })

        // 5. Build the option value map for quick lookup
        const optionValueMap = new Map<string, Map<string, string>>()

        let valueIndex = 0
        createdOptions.forEach((createdOption, optionIndex) => {
          const option = variantOptions[optionIndex]
          const valueMap = new Map<string, string>()

          option!.values.forEach((originalValue) => {
            const createdValue = createdValues[valueIndex]
            valueMap.set(originalValue.value, createdValue!.id)
            valueIndex++
          })

          optionValueMap.set(option!.name, valueMap)
        })
        // 6. Prepare all variant data (but don't create yet)
        const variantDataArray = variants.map((variant) => {
          const variantValueIds: string[] = []

          for (const [optionName, optionValue] of Object.entries(variant.attributes)) {
            const valueMap = optionValueMap.get(optionName)
            const valueId = valueMap?.get(optionValue)

            if (!valueId) {
              throw new Error(`Option value ID not found for ${optionName}: ${optionValue}`)
            }

            variantValueIds.push(valueId)
          }

          return {
            productId: product.id,
            sku: variant.sku,
            barcode: variant.barcode || null,
            images: variant.images || [],
            weight: variant.weight || null,
            dimensions: variant.dimensions || null,
            position: variant.position,
            variantValueIds,
          }
        })

        // 7. Create all variants IN PARALLEL
        const createdVariants = []
        for (const variantData of variantDataArray) {
          const { variantValueIds, ...data } = variantData
          const created = await tx.productVariant.create({
            data: {
              ...data,
              variantValues: {
                create: variantValueIds.map((valueId) => ({
                  optionValueId: valueId,
                })),
              },
            },
          })
          createdVariants.push(created)
        }

        return { product, variants: createdVariants }
      },
      {
        maxWait: 10000, // Maximum time to wait for transaction to start (10s)
        timeout: 30000, // Maximum time transaction can run (30s)
      }
    )
    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}

export async function updateProductAction(data: z.infer<typeof updateProductFormSchema>): Promise<ActionResponse> {
  try {
    const validatedData = updateProductFormSchema.parse(data)

    const { id, name, description, baseBuyPrice, baseSellPrice, brandId, condition, hasVariants, images, status, variantOptions, variants, categoryIds } = validatedData

    // ============================================
    // SIMPLE PRODUCT (No Variants)
    // ============================================
    if (!hasVariants) {
      await prisma.product.update({
        where: { id },
        data: {
          name,
          brandId,
          baseSellPrice,
          baseBuyPrice,
          hasVariants: false,
          status,
          condition,
          description,
          tags: validatedData.tags ?? [],
          images,
          sku: validatedData.sku || null,
          barcode: validatedData.barcode || null,
          weight: validatedData.weight || null,
          dimensions: validatedData.dimensions || null,
          categories: {
            set: categoryIds.map((id) => ({ id })),
          },
          // Clear any existing variants
          variants: { deleteMany: {} },
          variantOptions: { deleteMany: {} },
          documents: {
            deleteMany: {},
            create: validatedData.documents.map((doc) => ({
              name: doc.name,
              url: doc.url,
            })),
          },
        },
      })

      return { success: true }
    }

    // ============================================
    // PRODUCT WITH VARIANTS
    // ============================================
    if (!variantOptions?.length || !variants?.length) {
      return {
        success: false,
        error: "Variant options and variants are required for products with variants",
      }
    }

    await prisma.$transaction(
      async (tx) => {
        // 1. Update base product
        await tx.product.update({
          where: { id },
          data: {
            name,
            brandId,
            baseSellPrice,
            baseBuyPrice,
            hasVariants: true,
            status,
            condition,
            description,
            images,
            tags: validatedData.tags ?? [],
            categories: {
              set: categoryIds.map((id) => ({ id })),
            },
          },
        })

        // 2. Delete existing documents and recreate them
        await tx.productDocument.deleteMany({ where: { productId: id } })

        if (validatedData.documents?.length) {
          await tx.productDocument.createMany({
            data: validatedData.documents.map((doc) => ({
              productId: id,
              name: doc.name,
              url: doc.url,
            })),
          })
        }

        // 3. Delete existing variants (cascades to variantValues via schema)
        await tx.productVariant.deleteMany({ where: { productId: id } })

        // 4. Delete existing variant options and values (cascades to values via schema)
        await tx.variantOption.deleteMany({ where: { productId: id } })

        // 5. Recreate variant options
        const createdOptions = await tx.variantOption.createManyAndReturn({
          data: variantOptions.map((option) => ({
            productId: id,
            name: option.name,
            position: option.position,
          })),
        })

        // 6. Recreate option values
        const createdValues = await tx.variantOptionValue.createManyAndReturn({
          data: createdOptions.flatMap((createdOption, optionIndex) => {
            const option = variantOptions[optionIndex]
            return option!.values.map((value) => ({
              optionId: createdOption.id,
              value: value.value,
              position: value.position,
            }))
          }),
        })

        // 7. Build option value map
        const optionValueMap = new Map<string, Map<string, string>>()

        let valueIndex = 0
        createdOptions.forEach((createdOption, optionIndex) => {
          const option = variantOptions[optionIndex]
          const valueMap = new Map<string, string>()

          option!.values.forEach((originalValue) => {
            const createdValue = createdValues[valueIndex]
            valueMap.set(originalValue.value, createdValue!.id)
            valueIndex++
          })

          optionValueMap.set(option!.name, valueMap)
        })

        // 8. Prepare variant data
        const variantDataArray = variants.map((variant) => {
          const variantValueIds: string[] = []

          for (const [optionName, optionValue] of Object.entries(variant.attributes)) {
            const valueMap = optionValueMap.get(optionName)
            const valueId = valueMap?.get(optionValue)

            if (!valueId) {
              throw new Error(`Option value ID not found for ${optionName}: ${optionValue}`)
            }

            variantValueIds.push(valueId)
          }

          return {
            productId: id,
            sku: variant.sku,
            barcode: variant.barcode || null,
            images: variant.images || [],
            weight: variant.weight || null,
            dimensions: variant.dimensions || null,
            position: variant.position,
            variantValueIds,
          }
        })

        // 9. Recreate variants
        for (const variantData of variantDataArray) {
          const { variantValueIds, ...data } = variantData
          await tx.productVariant.create({
            data: {
              ...data,
              variantValues: {
                create: variantValueIds.map((valueId) => ({
                  optionValueId: valueId,
                })),
              },
            },
          })
        }
      },
      {
        maxWait: 10000,
        timeout: 30000,
      }
    )

    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}

export async function deleteProductAction(productId: string): Promise<ActionResponse> {
  try {
    if (!productId || !isUUID(productId)) return { success: false, error: "Missing or invalid product ID." }

    await prisma.product.delete({
      where: { id: productId },
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}
