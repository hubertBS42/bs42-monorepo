import StaticLogo from "@/public/images/logo.png"
import { BreadcrumbConfig } from "./types"
import { StorePlan, StoreStatus } from "@/types"
import { capitalizeFirstLetter } from "@bs42/utils"

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "BS42.NET"
export const APP_DESCRIPTION =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
export const APP_URL =
  process.env.NEXT_PUBLIC_ADMIN_SERVER_URL || "http://localhost:3000"
export const APP_LOGO = {
  static: StaticLogo,
  url: `${APP_URL}/images/logo.png`,
}

export const BREADCRUMB_DATA: BreadcrumbConfig[] = [
  {
    pathname: "/",
    segments: [
      {
        text: "Dashboard",
        href: "/",
      },
    ],
  },
  {
    pathname: "/stores",
    segments: [
      { text: "Dashboard", href: "/" },
      { text: "Manage Stores", href: "#" },
    ],
  },
  {
    pathname: "/stores/add",
    segments: [
      { text: "Dashboard", href: "/" },
      { text: "Manage Stores", href: "/stores" },
      { text: "Add Store", href: "#" },
    ],
  },
  {
    pathname: "/stores/[id]/edit",
    segments: [
      { text: "Dashboard", href: "/" },
      { text: "Manage Stores", href: "/stores" },
      { text: "Edit Store", href: "#" },
    ],
  },
  {
    pathname: "/users",
    segments: [
      { text: "Dashboard", href: "/" },
      { text: "Manage Users", href: "#" },
    ],
  },
  {
    pathname: "/users/add",
    segments: [
      { text: "Dashboard", href: "/" },
      { text: "Manage Users", href: "/users" },
      { text: "Add User", href: "#" },
    ],
  },
  {
    pathname: "/users/[id]/edit",
    segments: [
      { text: "Dashboard", href: "/" },
      { text: "Manage Users", href: "/users" },
      { text: "Edit User", href: "#" },
    ],
  },
  {
    pathname: "/members",
    segments: [
      { text: "Dashboard", href: "/" },
      { text: "Manage Members", href: "#" },
    ],
  },
  {
    pathname: "/members/[id]/details",
    segments: [
      { text: "Dashboard", href: "/" },
      { text: "Manage Members", href: "/members" },
      { text: "Member Details", href: "#" },
    ],
  },
  {
    pathname: "/store",
    segments: [
      { text: "Dashboard", href: "/" },
      { text: "Store Overview", href: "#" },
    ],
  },
  {
    pathname: "/store/logs",
    segments: [
      { text: "Dashboard", href: "/" },
      { text: "Store Logs", href: "#" },
    ],
  },
  {
    pathname: "/store/members",
    segments: [
      { text: "Dashboard", href: "/" },
      { text: "Store Members", href: "#" },
    ],
  },
  {
    pathname: "/store/invitations",
    segments: [
      { text: "Dashboard", href: "/" },
      { text: "Store Invitations", href: "#" },
    ],
  },
  {
    pathname: "/account",
    segments: [
      { text: "Dashboard", href: "/" },
      { text: "Account Overview", href: "#" },
    ],
  },
  {
    pathname: "/account/profile",
    segments: [
      { text: "Dashboard", href: "/" },
      { text: "Account Overview", href: "/account" },
      { text: "Profile Details", href: "#" },
    ],
  },
  {
    pathname: "/account/password",
    segments: [
      { text: "Dashboard", href: "/" },
      { text: "Account Overview", href: "/account" },
      { text: "Change Password", href: "#" },
    ],
  },
  {
    pathname: "/account/sessions",
    segments: [
      { text: "Dashboard", href: "/" },
      { text: "Account Overview", href: "/account" },
      { text: "Manage Sessions", href: "#" },
    ],
  },
  {
    pathname: "/logs",
    segments: [
      { text: "Dashboard", href: "/" },
      { text: "Activity Logs", href: "#" },
    ],
  },
]

export const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50]
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]

export const STORE_STATUS_OPTIONS = Object.values(StoreStatus).map((value) => ({
  label: capitalizeFirstLetter(value),
  value,
}))

export const STORE_PLAN_OPTIONS = Object.values(StorePlan).map((value) => ({
  label: capitalizeFirstLetter(value),
  value,
}))
