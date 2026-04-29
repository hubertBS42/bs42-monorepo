import { LucideIcon } from "lucide-react"
import { Session, Member, Organization, User, Prisma } from "@bs42/db/client"
import { OrganizationPlan, OrganizationStatus } from "@bs42/db/enums"

export interface BreadcrumbSegment {
  text: string
  href: string
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
  items?: NavSubItem[]
}

// value aliases
export const StorePlan = OrganizationPlan
export const StoreStatus = OrganizationStatus

// type aliases
export type StorePlan = OrganizationPlan
export type StoreStatus = OrganizationStatus

export type Store = Omit<Organization, "plan" | "status"> & {
  plan: StorePlan
  status: StoreStatus
}

export type MemberWithUser = Prisma.MemberGetPayload<{
  include: {
    user: true
  }
}>

export type InvitationWithInviter = Prisma.InvitationGetPayload<{
  include: {
    inviter: true
  }
}>

export type InvitationWithInviterWithStore = Prisma.InvitationGetPayload<{
  include: {
    inviter: true
    organization: true
  }
}>

export type UserWithSessions = Prisma.UserGetPayload<{
  include: {
    sessions: true
  }
}>

export type MemberWithUserWithSessions = Prisma.MemberGetPayload<{
  include: {
    user: {
      include: {
        sessions: true
      }
    }
  }
}>

export type UserWithSessionsAndMemberships = User & {
  sessions: Session[]
  members: (Member & { organization: Store })[]
}

interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface PaginatedFilters {
  page?: number
  pageSize?: number
  sort?: string
  order?: string
}

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

export type InvitationsData = PaginatedResult<InvitationWithInviter>

export interface MembersFilters extends PaginatedFilters {
  name?: string
}

export type MembersData = PaginatedResult<MemberWithUser>
