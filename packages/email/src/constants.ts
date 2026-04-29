export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME
export const APP_LOGO = process.env.NEXT_PUBLIC_APP_LOGO
export const INVITATION_EXPIRATON = process.env.INVITATION_EXPIRATON
  ? Number(process.env.INVITATION_EXPIRATON)
  : 1800
export const RESET_PASSWORD_TOKEN_EXPIRATON = process.env
  .RESET_PASSWORD_TOKEN_EXPIRATON
  ? Number(process.env.RESET_PASSWORD_TOKEN_EXPIRATON)
  : 1800
export const SITE_MAILER_HOST = process.env.SITE_MAILER_HOST
export const SITE_MAILER_EMAIL = process.env.SITE_MAILER_EMAIL
export const SITE_MAILER_PASSWORD = process.env.SITE_MAILER_PASSWORD
export const SITE_MAILER_PORT = process.env.SITE_MAILER_PORT
  ? Number(process.env.SITE_MAILER_PORT)
  : 465
