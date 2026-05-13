import { LucideIcon } from "lucide-react"
import { Organization, User, Prisma, Brand } from "@bs42/db/client"
import { OrganizationStatus } from "@bs42/db/enums"
import { PaginatedFilters, PaginatedResult } from "@bs42/types"

export interface BreadcrumbSegment {
  text: string
  href: string
}

export interface DocumentItem {
  name: string
  url: string
}

export interface BreadcrumbConfig {
  pathname: string
  segments: BreadcrumbSegment[]
}

export interface NavSubItem {
  title: string
  url: string
  icon?: LucideIcon
  context?: ("global" | "store")[]
  items?: NavSubItem[]
}

export interface NavItem {
  title: string
  url: string
  icon: LucideIcon
  group: "main" | "secondary"
  order: number
  hideItems?: boolean
  items?: NavSubItem[]
}

// value aliases
export const StoreStatus = OrganizationStatus

// type aliases
export type StoreStatus = OrganizationStatus

export type Store = Omit<Organization, "status"> & {
  status: StoreStatus
}

export type MemberForTable = Prisma.MemberGetPayload<{
  include: {
    user: true
  }
}>

export type InvitationForTable = Prisma.InvitationGetPayload<{
  include: {
    inviter: true
  }
}>

export type InvitationDetails = Prisma.InvitationGetPayload<{
  include: {
    inviter: true
    organization: true
  }
}>

export type MemberDetails = Prisma.MemberGetPayload<{
  include: {
    user: {
      include: {
        sessions: true
      }
    }
  }
}>

export type UserDetails = Prisma.UserGetPayload<{
  include: {
    members: {
      include: {
        organization: true
      }
    }
  }
}>

export interface StoresFilters extends PaginatedFilters {
  name?: string
}

export type StoresData = PaginatedResult<Store>

export interface UsersFilters extends PaginatedFilters {
  name?: string
}

export type UsersData = PaginatedResult<User>

export interface InvitationsFilters extends PaginatedFilters {
  email?: string
}

export type InvitationsData = PaginatedResult<InvitationForTable>

export interface MembersFilters extends PaginatedFilters {
  name?: string
}

export type MembersData = PaginatedResult<MemberForTable>

export interface BrandsFilters extends PaginatedFilters {
  name?: string
}

export type BrandsData = PaginatedResult<Brand>

export type CategoryForSelect = Prisma.CategoryGetPayload<{
  select: {
    id: true
    name: true
    parentId: true
  }
}>

export type StoreForSelect = Prisma.OrganizationGetPayload<{
  select: {
    id: true
    name: true
  }
}>

export type BrandForSelect = Prisma.BrandGetPayload<{
  select: {
    id: true
    name: true
  }
}>

export type ProductListItem = Prisma.ProductGetPayload<{
  include: {
    brand: true
    categories: true
  }
}>

export interface ProductsFilters extends PaginatedFilters {
  name?: string
}

export type ProductsData = PaginatedResult<ProductListItem>

export type ProductDetails = Prisma.ProductGetPayload<{
  include: {
    variants: {
      include: {
        variantValues: {
          include: {
            optionValue: {
              include: { option: true }
            }
          }
        }
      }
    }
    variantOptions: {
      include: { values: true }
    }
    categories: true
    documents: true
    brand: true
  }
}>

export type ListingDetails = Prisma.StoreListingGetPayload<{
  include: {
    product: {
      include: {
        brand: true
        categories: true
        variants: {
          include: {
            variantValues: {
              include: {
                optionValue: {
                  include: { option: true }
                }
              }
            }
          }
        }
      }
    }
    storeListingVariants: {
      include: {
        variant: true
      }
    }
  }
}>

export type ListingsListItem = Omit<ListingDetails, "product"> & {
  product: Omit<ListingDetails["product"], "variants"> & {
    variants?: ListingDetails["product"]["variants"]
  }
}

export interface ListingsFilters extends PaginatedFilters {
  name?: string
}

export type ListingsData = PaginatedResult<ListingsListItem>
