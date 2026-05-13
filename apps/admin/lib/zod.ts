import { STORE_ROLE_NAMES } from "@bs42/auth"
import { StoreStatus } from "@/types"
import { Condition, Status } from "@bs42/db/enums"
import { z } from "zod"
import { isURL, isUUID } from "validator"

export const signInFormSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string(),
})

export const signUpFormSchema = z
  .object({
    fullName: z.string().min(3, "Full name must be at least 3 characters."),
    email: z.email("Invalid email address."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export const resetPasswordFormSchema = z.object({
  email: z.email("Invalid email address"),
})

export const setPasswordFormSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords don't match",
    path: ["confirmPassword"],
  })

export const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "You need to provide the current password."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export const addUserFormSchema = z.discriminatedUnion("systemRole", [
  z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Please enter a valid email address"),
    image: z.url("Invalid URL").optional().or(z.literal("")),
    systemRole: z.literal("admin"),
  }),
  z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Please enter a valid email address"),
    image: z.url("Invalid URL").optional().or(z.literal("")),
    systemRole: z.literal("user"),
    stores: z.array(
      z.object({
        storeId: z.string().min(1, "Store is required"),
        storeRole: z.enum(["member", "admin"] as const),
      })
    ),
  }),
])

export const editAdminFormSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.email("Please enter a valid email address"),
  image: z.url("Invalid URL").optional().or(z.literal("")),
})

export const editStoreUserFormSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.email("Please enter a valid email address"),
  image: z.url("Invalid URL").optional().or(z.literal("")),
  stores: z.array(
    z.object({
      memberId: z.string().optional(),
      storeId: z.string().min(1, "Store is required"),
      storeRole: z.enum(STORE_ROLE_NAMES),
      isNew: z.boolean(),
    })
  ),
})

export const editUserFormSchema = z.discriminatedUnion("systemRole", [editAdminFormSchema, editStoreUserFormSchema])

export const banUserFormSchema = z.object({
  userId: z.string().min(1, "UserId is required"),
  banReason: z.string().nullable(),
  banExpiresIn: z
    .date()
    .nullable()
    .refine((date) => !date || date.getTime() > Date.now(), {
      message: "Ban expiration must be in the future.",
    }),
})

export const inviteMemberFormSchema = z.object({
  email: z.email("Please enter a valid email address"),
  role: z.enum(["member", "admin"] as const),
})

// const slugSchema = z
//   .string()
//   .min(1, "You must provide a store slug")
//   .min(3, "Slug must be at least 3 characters")
//   .max(63, "Slug must be 63 characters or less")
//   .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug can only contain lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen")

export const addStoreFormSchema = z.object({
  name: z.string().min(1, "You must provide an store name").min(3, "Store name must be at least 3 characters"),
  logo: z.url("Invalid URL").optional().or(z.literal("")),
  shippingPolicy: z.string().nullable(),
  returnsPolicy: z.string().nullable(),
  status: z.enum(StoreStatus),
})

export const updateStoreFormSchema = addStoreFormSchema.extend({
  id: z.string().min(1, "ID is required"),
})

export const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  image: z.url("Invalid URL").optional().or(z.literal("")),
})

export const updatePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  })

export const addBrandFormSchema = z.object({
  name: z.string().min(1, "You must provide a brand name.").min(3, "Brand name must be at least 3 characters."),
  logo: z.url("Invalid URL").optional().or(z.literal("")),
  website: z
    .string()
    .refine((url) => !url || isURL(url), { message: "Invalid website URL." })
    .optional()
    .or(z.literal("")),
  description: z.string().nullable(),
  isFeatured: z.boolean(),
  status: z.enum(Status),
})

// Schema for updating brand
export const updateBrandFormSchema = addBrandFormSchema.extend({
  id: z.string().min(1, "ID is required"),
})

export const addCategoryFormSchema = z.object({
  name: z.string().min(1, "You must provide a category name.").min(3, "Category name must be at least 3 characters."),
  description: z.string().nullable(),
  image: z.url("Invalid URL").optional().or(z.literal("")),
  parentId: z
    .string()
    .transform((val) => (val === "null" ? null : val))
    .nullable()
    .refine((id) => !id || isUUID(id), {
      message: "Invalid parent category ID.",
    }),
  isFeatured: z.boolean(),
  status: z.enum(Status),
})

export const updateCategoryFormSchema = addCategoryFormSchema.extend({
  id: z
    .string()
    .min(1, "ID is required")
    .refine((id) => !id || isUUID(id), { message: "Invalid category ID." }),
})

// Helper schema for decimal validation
const decimalSchema = z
  .number("Enter a numeric value")
  .min(0, { message: "Amount must be zero or positive" })
  .refine(
    (value) => {
      const decimalPart = value.toString().split(".")[1]
      return !decimalPart || decimalPart.length <= 2
    },
    { message: "Amount cannot have more than two decimal places" }
  )
const optionalDecimalSchema = decimalSchema.nullable().optional()

// ============================================
// VARIANT OPTION SCHEMAS
// ============================================

export const variantOptionValueSchema = z.object({
  id: z.string().optional(),
  value: z.string().min(1, "Value is required"),
  position: z.number().int(),
})

export const variantOptionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Option name is required"),
  position: z.number().int(),
  values: z.array(variantOptionValueSchema).min(1, "At least one value is required"),
})

// ============================================
// VARIANT SCHEMA
// ============================================

export const productVariantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(1, "SKU is required"),
  barcode: z.string().nullable().optional(),
  images: z.array(z.string()),
  weight: optionalDecimalSchema,
  dimensions: z.string().nullable().optional(),
  position: z.number().int(),
  attributes: z.record(z.string(), z.string()).refine((attrs) => Object.keys(attrs).length > 0, {
    message: "At least one attribute is required",
  }),
})

export const productDocumentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Document name is required"),
  url: z.string().min(1, "Document URL is required"),
})

// ============================================
// MAIN PRODUCT FORM SCHEMA
// ============================================

export const addProductFormSchema = z
  .object({
    name: z.string().min(1, "You must provide a product name.").min(3, "Product name must be at least 3 characters."),
    brandId: z.uuid("You must provide a valid product brand."),
    baseSellPrice: decimalSchema,
    baseBuyPrice: decimalSchema,
    categoryIds: z.array(z.uuid()).min(1, "Select at least one category"),
    hasVariants: z.boolean(),
    condition: z.enum(Condition),
    description: z.string().nullable(),
    images: z.array(z.string()).min(1, "You must provide at least one image."),
    status: z.enum(Status),
    banner: z.url("Invalid URL").optional().or(z.literal("")),
    tags: z.array(z.string()),
    documents: z.array(productDocumentSchema),

    // Simple product fields (only when hasVariants is false)
    sku: z.string().nullable().optional().or(z.literal("")),
    barcode: z.string().nullable().optional().or(z.literal("")),
    dimensions: z.string().nullable().optional().or(z.literal("")),
    weight: optionalDecimalSchema,

    // Variant-related fields (only required if hasVariants is true)
    variantOptions: z.array(variantOptionSchema).optional(),
    variants: z.array(productVariantSchema).optional(),
  })
  .superRefine((data, ctx) => {
    // ============================================
    // VALIDATION FOR PRODUCTS WITHOUT VARIANTS
    // ============================================
    if (!data.hasVariants) {
      if (data.variantOptions && data.variantOptions.length > 0) {
        ctx.addIssue({
          code: "custom",
          message: "Variant options should not be provided when hasVariants is false",
          path: ["variantOptions"],
        })
      }

      if (data.variants && data.variants.length > 0) {
        ctx.addIssue({
          code: "custom",
          message: "Variants should not be provided when hasVariants is false",
          path: ["variants"],
        })
      }
    }

    // ============================================
    // VALIDATION FOR PRODUCTS WITH VARIANTS
    // ============================================
    if (data.hasVariants) {
      if (!data.variantOptions || data.variantOptions.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: "At least one variant option is required when hasVariants is true",
          path: ["variantOptions"],
        })
      }

      if (!data.variants || data.variants.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: "At least one variant is required when hasVariants is true",
          path: ["variants"],
        })
      }

      if (data.variantOptions && data.variants) {
        const optionNames = new Set(data.variantOptions.map((opt) => opt.name))

        data.variants.forEach((variant, variantIdx) => {
          const variantAttrKeys = Object.keys(variant.attributes)

          variantAttrKeys.forEach((attrKey) => {
            if (!optionNames.has(attrKey)) {
              ctx.addIssue({
                code: "custom",
                message: `Attribute "${attrKey}" is not defined in variant options`,
                path: ["variants", variantIdx, "attributes", attrKey],
              })
            }
          })

          optionNames.forEach((optionName) => {
            if (!variantAttrKeys.includes(optionName)) {
              ctx.addIssue({
                code: "custom",
                message: `Missing required attribute "${optionName}"`,
                path: ["variants", variantIdx, "attributes"],
              })
            }
          })
        })
      }
    }
  })

export const updateProductFormSchema = addProductFormSchema.extend({
  id: z.uuid("ID is required"),
})

const listingVariantSchema = z.object({
  variantId: z.uuid(),
  sellPrice: optionalDecimalSchema,
  buyPrice: optionalDecimalSchema,
  compareAtPrice: optionalDecimalSchema,
  stock: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0),
  trackInventory: z.boolean(),
  status: z.enum(Status),
})

export const addListingFormSchema = z.object({
  organizationId: z.uuid(),
  productId: z.uuid(),
  sellPrice: decimalSchema,
  buyPrice: optionalDecimalSchema,
  compareAtPrice: optionalDecimalSchema,
  stock: z.number().int().min(0, "Stock cannot be negative"),
  lowStockThreshold: z.number().int().min(0),
  trackInventory: z.boolean(),
  status: z.enum(Status),
  isFeatured: z.boolean(),
  variants: z.array(listingVariantSchema).optional(),
})

export const updateListingFormSchema = addListingFormSchema.extend({ id: z.uuid() })
