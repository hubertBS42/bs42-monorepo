import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { Prisma, PrismaClient } from "../generated/prisma/client.js"
import { generateSlug } from "@bs42/utils"
import { deleteFiles } from "@bs42/storage"

const globalForPrisma = global as unknown as {
  prisma: ReturnType<typeof createPrisma>
}

type ModelType = "organization" | "brand" | "category" | "product"
type SlugClient = PrismaClient | Prisma.TransactionClient

const generateUniqueSlug = async ({ name, id, model, client }: { name: string; id?: string; model: ModelType; client: SlugClient }): Promise<string> => {
  const baseSlug = generateSlug(name)
  let slug = baseSlug
  let count = 1

  const modelMap: Record<
    ModelType,
    {
      getById: (id: string) => Promise<{ name: string; slug: string } | null>
      getBySlug: (slug: string) => Promise<{ id: string } | null>
    }
  > = {
    organization: {
      getById: (id) =>
        client.organization.findUnique({
          where: { id },
          select: { name: true, slug: true },
        }),
      getBySlug: (slug) => client.organization.findUnique({ where: { slug }, select: { id: true } }),
    },
    brand: {
      getById: (id) =>
        client.brand.findUnique({
          where: { id },
          select: { name: true, slug: true },
        }),
      getBySlug: (slug) => client.brand.findUnique({ where: { slug }, select: { id: true } }),
    },
    category: {
      getById: (id) =>
        client.category.findUnique({
          where: { id },
          select: { name: true, slug: true },
        }),
      getBySlug: (slug) => client.category.findUnique({ where: { slug }, select: { id: true } }),
    },
    product: {
      getById: (id) =>
        client.product.findUnique({
          where: { id },
          select: { name: true, slug: true },
        }),
      getBySlug: (slug) => client.product.findUnique({ where: { slug }, select: { id: true } }),
    },
  }

  const { getById, getBySlug } = modelMap[model]

  // Step 1: If ID is provided, check if name has changed
  if (id) {
    const existingRecord = await getById(id)
    if (existingRecord && existingRecord.name.trim() === name.trim()) {
      return existingRecord.slug // name hasn't changed → keep slug
    }
  }

  // Step 2: Generate unique slug
  let existing = await getBySlug(slug)
  while (existing && existing.id !== id) {
    slug = `${baseSlug}-${count++}`
    existing = await getBySlug(slug)
  }

  return slug
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertDecimals(obj: any): any {
  if (!obj || typeof obj !== "object") return obj

  // Handle Date objects (optional)
  if (obj instanceof Date) {
    return obj
  }

  // Create new object with converted decimals
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newObj: any = Array.isArray(obj) ? [] : {}

  for (const key in obj) {
    const value = obj[key]

    // Convert Decimal to number
    if (value && typeof value === "object" && "toNumber" in value) {
      newObj[key] = value.toNumber()
    }
    // Recursively handle nested objects
    else if (value && typeof value === "object" && !(value instanceof Date)) {
      newObj[key] = convertDecimals(value)
    }
    // Copy other values
    else {
      newObj[key] = value
    }
  }

  return newObj
}

function createPrisma() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const base = new PrismaClient({ adapter: new PrismaPg(pool) })

  return base.$extends({
    query: {
      // $allModels: {
      //   async findMany({ args, query }) {
      //     const result = await query(args)
      //     return result.map(convertDecimals)
      //   },
      //   async findUnique({ args, query }) {
      //     const result = await query(args)
      //     return result ? convertDecimals(result) : result
      //   },
      //   async findFirst({ args, query }) {
      //     const result = await query(args)
      //     return result ? convertDecimals(result) : result
      //   },
      // },
      organization: {
        async create({ args, query }) {
          args.data.slug = await generateUniqueSlug({
            name: args.data.name,
            model: "organization",
            client: base,
          })
          return query(args)
        },
        async update({ args, query }) {
          if (args.data.name) {
            args.data.slug = await generateUniqueSlug({
              name: args.data.name as string,
              id: args.where.id as string,
              model: "organization",
              client: base,
            })
          }
          return query(args)
        },
        async delete({ args }) {
          return await base.$transaction(async (tx) => {
            // Delete the organization
            const deletedOrganization = await tx.organization.delete({
              where: args.where,
            })

            if (deletedOrganization.logo) {
              // Delete organization logo
              await deleteFiles([deletedOrganization.logo])
            }

            return deletedOrganization
          })
        },
        async deleteMany({ args }) {
          return base.$transaction(async (tx) => {
            // Finds the organizations to delete
            const organizationsToDelete = await tx.organization.findMany({
              where: args.where,
              select: { id: true, name: true, logo: true },
            })
            const organizationIDs: string[] = []
            const logos: string[] = []

            for (const organization of organizationsToDelete) {
              organizationIDs.push(organization.id)

              if (organization.logo) {
                logos.push(organization.logo)
              }
            }

            // Delete the organizations
            const deletedOrganizations = await tx.organization.deleteMany({
              where: { id: { in: organizationIDs } },
            })

            // Delete organization logos
            await deleteFiles(logos)

            return deletedOrganizations
          })
        },
      },
      user: {
        async delete({ args }) {
          return await base.$transaction(async (tx) => {
            // Delete the user
            const deletedUser = await tx.user.delete({
              where: args.where,
            })

            if (deletedUser.image) {
              // Delete user logo
              await deleteFiles([deletedUser.image])
            }

            return deletedUser
          })
        },
        async deleteMany({ args }) {
          return base.$transaction(async (tx) => {
            // Finds the users to delete
            const usersToDelete = await tx.user.findMany({
              where: args.where,
              select: { id: true, name: true, image: true },
            })
            const userIDs: string[] = []
            const images: string[] = []

            for (const user of usersToDelete) {
              userIDs.push(user.id)

              if (user.image) {
                images.push(user.image)
              }
            }

            // Delete the users
            const deletedUsers = await tx.user.deleteMany({
              where: { id: { in: userIDs } },
            })

            // Delete user logos
            await deleteFiles(images)

            return deletedUsers
          })
        },
      },
      brand: {
        async create({ args, query }) {
          args.data.slug = await generateUniqueSlug({
            name: args.data.name,
            model: "brand",
            client: base,
          })
          return query(args)
        },
        async update({ args, query }) {
          if (args.data.name) {
            args.data.slug = await generateUniqueSlug({
              name: args.data.name as string,
              id: args.where.id as string,
              model: "brand",
              client: base,
            })
          }
          return query(args)
        },
        async delete({ args }) {
          return await base.$transaction(async (tx) => {
            // Find the brand to delete
            const brandToDelete = await tx.brand.findUnique({
              where: args.where,
              select: { id: true, logo: true, products: true },
            })

            if (!brandToDelete) throw new Error("Brand not found")

            if (brandToDelete.products.length > 0) throw new Error("Brand is assigned to at least one product.")

            // Delete the brand
            const deletedBrand = await tx.brand.delete({
              where: { id: brandToDelete.id },
            })

            if (brandToDelete.logo) {
              // Delete brand logo
              await deleteFiles([brandToDelete.logo])
            }

            return deletedBrand
          })
        },
        async deleteMany({ args }) {
          return base.$transaction(async (tx) => {
            // Finds the brand to delete
            const brandsToDelete = await tx.brand.findMany({
              where: args.where,
              select: { id: true, name: true, logo: true, products: true },
            })
            const brandIDs: string[] = []
            const logos: string[] = []
            const brands: string[] = []

            for (const brand of brandsToDelete) {
              if (brand.products.length > 0) {
                brands.push(brand.name)
              }
              brandIDs.push(brand.id)

              if (brand.logo) {
                logos.push(brand.logo)
              }
            }

            if (brands.length > 0) throw new Error(`${brands.join(", ")} has at least one assigned product.`)

            // Delete the brands
            const deletedBrands = await tx.brand.deleteMany({
              where: { id: { in: brandIDs } },
            })

            // Delete brand logos
            await deleteFiles(logos)

            return deletedBrands
          })
        },
      },
      category: {
        async create({ args, query }) {
          args.data.slug = await generateUniqueSlug({
            name: args.data.name,
            model: "category",
            client: base,
          })
          return query(args)
        },
        async update({ args, query }) {
          if (args.data.name) {
            args.data.slug = await generateUniqueSlug({
              name: args.data.name as string,
              id: args.where.id as string,
              model: "category",
              client: base,
            })
          }
          return query(args)
        },
        async delete({ args }) {
          return await base.$transaction(async (tx) => {
            // Find the category to delete
            const categoryToDelete = await tx.category.findUnique({
              where: args.where,
              select: {
                id: true,
                image: true,
                childCategories: true,
                products: true,
              },
            })

            if (!categoryToDelete) throw new Error("Category not found")

            if (categoryToDelete.childCategories.length > 0) throw new Error("Category has child categories")
            if (categoryToDelete.products.length > 0) throw new Error("Category is assigned to at least one product")

            // Delete the category
            const deletedCategory = await tx.category.delete({
              where: { id: categoryToDelete.id },
            })

            // Delete category images
            if (categoryToDelete.image) {
              await deleteFiles([categoryToDelete.image])
            }

            return deletedCategory
          })
        },
        async deleteMany({ args }) {
          return base.$transaction(async (tx) => {
            // Find the categories to delete
            const categoriesToDelete = await tx.category.findMany({
              where: args.where,
              select: {
                id: true,
                name: true,
                image: true,
                childCategories: true,
                products: true,
              },
            })
            const categoryIDs: string[] = []
            const images: string[] = []
            const childCategories: string[] = []
            const products: string[] = []

            for (const category of categoriesToDelete) {
              if (category.childCategories.length > 0) {
                childCategories.push(category.name)
              }
              if (category.products.length > 0) {
                products.push(category.name)
              }
              categoryIDs.push(category.id)
              if (category.image) {
                images.push(category.image)
              }
            }

            if (childCategories.length > 0) throw new Error(`${childCategories.join(", ")} has at least one child category.`)
            if (products.length > 0) throw new Error(`${products.join(", ")} has at least one assigned product.`)

            // Delete the categories
            const deletedCategories = await tx.category.deleteMany({
              where: { id: { in: categoryIDs } },
            })

            // Delete category images
            await deleteFiles(images)

            return deletedCategories
          })
        },
      },
      product: {
        async create({ args, query }) {
          args.data.slug = await generateUniqueSlug({
            name: args.data.name,
            model: "product",
            client: base,
          })
          return query(args)
        },
        async update({ args, query }) {
          if (args.data.name) {
            args.data.slug = await generateUniqueSlug({
              name: args.data.name as string,
              id: args.where.id as string,
              model: "product",
              client: base,
            })
          }
          return query(args)
        },
        async delete({ args }) {
          return base.$transaction(async (tx) => {
            const productToDelete = await tx.product.findUnique({
              where: args.where,
              select: {
                id: true,
                images: true,
                documents: { select: { url: true } },
                variants: {
                  select: { images: true },
                },
              },
            })

            if (!productToDelete) throw new Error("Product not found")

            const deletedProduct = await tx.product.delete({
              where: { id: productToDelete.id },
            })

            const files = [...productToDelete.images, ...productToDelete.variants.flatMap((v) => v.images)]

            for (const document of productToDelete.documents) {
              files.push(document.url)
            }
            // Delete product images and documents
            if (files.length) await deleteFiles(files)
            return deletedProduct
          })
        },
        async deleteMany({ args }) {
          return base.$transaction(async (tx) => {
            // Finds the products to delete
            const productsToDelete = await tx.product.findMany({
              where: args.where,
              select: {
                id: true,
                images: true,
                documents: { select: { url: true } },
                variants: {
                  select: { images: true },
                },
              },
            })
            const productIDs: string[] = []
            const files: string[] = []

            for (const product of productsToDelete) {
              productIDs.push(product.id)
              files.push(...product.images)
              files.push(...product.variants.flatMap((v) => v.images))
              files.push(...product.documents.flatMap((d) => d.url))
            }

            // Delete the products
            const deletedProducts = await tx.product.deleteMany({
              where: { id: { in: productIDs } },
            })

            // Delete product images and documents
            if (files.length) await deleteFiles(files)

            return deletedProducts
          })
        },
        async findMany({ args, query }) {
          const result = await query(args)
          return result.map(convertDecimals)
        },
        async findUnique({ args, query }) {
          const result = await query(args)
          return result ? convertDecimals(result) : result
        },
        async findFirst({ args, query }) {
          const result = await query(args)
          return result ? convertDecimals(result) : result
        },
      },
      storeListing: {
        async findMany({ args, query }) {
          const result = await query(args)
          return result.map(convertDecimals)
        },
        async findUnique({ args, query }) {
          const result = await query(args)
          return result ? convertDecimals(result) : result
        },
        async findFirst({ args, query }) {
          const result = await query(args)
          return result ? convertDecimals(result) : result
        },
      },
      storeListingVariant: {
        async findMany({ args, query }) {
          const result = await query(args)
          return result.map(convertDecimals)
        },
        async findUnique({ args, query }) {
          const result = await query(args)
          return result ? convertDecimals(result) : result
        },
        async findFirst({ args, query }) {
          const result = await query(args)
          return result ? convertDecimals(result) : result
        },
      },
      order: {
        async create({ args, query }) {
          // Generate reference: BS42-YYYYMMDD-XXXXX
          const date = new Date()
          const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "")
          const random = Math.random().toString(36).substring(2, 7).toUpperCase()
          args.data.reference = `BS42-${dateStr}-${random}`
          return query(args)
        },
        async findMany({ args, query }) {
          const result = await query(args)
          return result.map(convertDecimals)
        },
        async findUnique({ args, query }) {
          const result = await query(args)
          return result ? convertDecimals(result) : result
        },
        async findFirst({ args, query }) {
          const result = await query(args)
          return result ? convertDecimals(result) : result
        },
      },
    },
  })
}

export const prisma = globalForPrisma.prisma ?? createPrisma()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
