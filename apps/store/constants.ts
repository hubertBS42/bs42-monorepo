import StaticLogo from "@/public/images/logo.png"

export const APP_NAME = "BS42.NET"
export const APP_DESCRIPTION =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
export const APP_URL =
  process.env.NEXT_PUBLIC_STORE_SERVER_URL || "http://localhost:3001"
export const APP_LOGO = {
  static: StaticLogo,
  url: `${APP_URL}/images/logo.png`,
}
