import { LucideIcon } from "lucide-react"
import { Organization, User, Prisma, Brand } from "@bs42/db/client"
import { OrganizationStatus, OrderStatus } from "@bs42/db/enums"
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
    addresses: true
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
  select: {
    id: true
    name: true
    images: true
    brand: {
      select: { name: true }
    }
    baseSellPrice: true
    categories: {
      select: { name: true }
    }
    condition: true
    hasVariants: true
    status: true
    createdAt: true
  }
}>

export type ProductForBrowser = Prisma.ProductGetPayload<{
  select: {
    id: true
    name: true
    brand: {
      select: { name: true }
    }
    images: true
    hasVariants: true
    categories: {
      select: { name: true }
    }
    baseSellPrice: true
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

// export type ListingDetails = Prisma.StoreListingGetPayload<{
//   include: {
//     product: {
//       include: {
//         brand: true
//         categories: true
//         variants: {
//           include: {
//             variantValues: {
//               include: {
//                 optionValue: {
//                   include: { option: true }
//                 }
//               }
//             }
//           }
//         }
//       }
//     }
//     storeListingVariants: {
//       include: {
//         variant: {
//           include: {
//             variantValues: {
//               include: {
//                 optionValue: {
//                   include: {
//                     option: true
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//     }
//     organization: true
//   }
// }>

export type ListingDetails = Prisma.StoreListingGetPayload<{
  include: {
    storeListingVariants: true
    product: {
      select: {
        name: true
        brand: { select: { name: true } }
        categories: {
          select: {
            id: true
            name: true
          }
        }
        images: true
        hasVariants: true
        variants: {
          select: {
            id: true
            variantValues: {
              select: {
                optionValue: {
                  select: {
                    option: {
                      select: { name: true }
                    }
                    value: true
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}>

export type ListingsListItem = Prisma.StoreListingGetPayload<{
  select: {
    id: true
    product: {
      select: {
        name: true
        images: true
        brand: {
          select: {
            name: true
          }
        }
        hasVariants: true
        categories: {
          select: { name: true }
        }
      }
    }
    sellPrice: true
    stock: true
    isFeatured: true
    status: true
    createdAt: true
  }
}>

export type ListingForOrder = Prisma.StoreListingGetPayload<{
  select: {
    id: true
    product: {
      select: {
        sku: true
        name: true
        brand: {
          select: { name: true }
        }
        hasVariants: true
        images: true
      }
    }
    sellPrice: true
    storeListingVariants: {
      select: {
        id: true
        sellPrice: true
        variantId: true
        variant: {
          select: {
            sku: true
            variantValues: {
              select: {
                optionValue: {
                  select: { option: true; value: true }
                }
              }
            }
          }
        }
      }
    }
    organization: {
      select: { name: true }
    }
  }
}>

// export type ListingsListItem = Omit<ListingDetails, "product"> & {
//   product: Omit<ListingDetails["product"], "variants"> & {
//     variants?: ListingDetails["product"]["variants"]
//   }
// }

export interface ListingsFilters extends PaginatedFilters {
  name?: string
}

export type ListingsData = PaginatedResult<ListingsListItem>

// export type OrderDetails = {
//   id: string
//   reference: string
//   userId: string | null
//   customerName: string
//   customerEmail: string
//   customerPhone: string | null
//   shippingName: string
//   shippingPhone: string | null
//   shippingLine1: string
//   shippingLine2: string | null
//   shippingRegion: string
//   shippingTown: string
//   shippingLat: number | null
//   shippingLng: number | null
//   paymentMethod: string
//   paymentStatus: string
//   paidAt: Date | null
//   status: OrderStatus
//   subtotal: number
//   shippingPrice: number
//   taxPrice: number
//   totalPrice: number
//   currency: string
//   exchangeRate: number
//   notes: string | null
//   createdAt: Date
//   updatedAt: Date
//   user: { name: string; email: string; phone?: string | null } | null
//   createdBy: { name: string } | null
//   orderItems: OrderItemDetails[]
//   statusHistory: OrderStatusHistoryItem[]
// }

export type OrderStatusHistoryItem = Prisma.OrderStatusHistoryGetPayload<{
  select: {
    id: true
    orderId: true
    status: true
    note: true
    createdAt: true
    changedBy: { select: { name: true } }
  }
}>

type BaseOrderDetails = Prisma.OrderGetPayload<{
  include: {
    user: {
      select: {
        name: true
        email: true
        phone: true
      }
    }
    createdBy: {
      select: {
        name: true
      }
    }
    orderItems: {
      include: {
        organization: {
          select: {
            name: true
            slug: true
          }
        }
        storeListing: {
          select: {
            product: {
              select: {
                name: true
                brand: {
                  select: {
                    name: true
                  }
                }
                images: true
              }
            }
          }
        }
        storeListingVariant: {
          select: {
            variant: {
              select: {
                sku: true
                images: true
              }
            }
          }
        }
      }
    }
  }
}>

export type OrderDetails = BaseOrderDetails & {
  statusHistory: OrderStatusHistoryItem[]
}

export type OrderListItem = Prisma.OrderGetPayload<{
  select: {
    reference: true
    customerName: true
    customerEmail: true
    exchangeRate: true
    orderItems: { select: { id: true } }
    totalPrice: true
    paymentStatus: true
    status: true
    createdAt: true
  }
}>

// export type OrderItemDetails = {
//   id: string
//   orderId: string
//   organizationId: string
//   storeListingId: string
//   storeListingVariantId: string | null
//   quantity: number
//   unitPrice: number
//   totalPrice: number
//   productName: string
//   productSlug: string
//   productImage: string | null
//   variantDescription: string | null
//   sku: string | null
//   storeName: string
//   organization: { name: string; slug: string }
//   storeListing: {
//     product: { name: string; brand: { name: string }; images: string[] }
//   }
//   storeListingVariant: {
//     variant: { sku: string; images: string[] }
//   } | null
// }

export interface OrdersFilters extends PaginatedFilters {
  reference?: string
  status?: OrderStatus
}

export type OrdersData = PaginatedResult<OrderDetails>

export type UserSearchResult = Prisma.UserGetPayload<{
  select: {
    id: true
    name: true
    email: true
    phone: true
  }
}>
