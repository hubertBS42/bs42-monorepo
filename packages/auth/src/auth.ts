import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "@bs42/db"
import { admin, organization } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js"
import { systemAccessController, systemRoles } from "./system-permissions"
import { storeAccessController, storeRoles } from "./store-permissions"
import {
  InviteMemberEmail,
  PasswordUpdatedEmail,
  ResetPasswordEmail,
  sendEmail,
  SetPasswordEmail,
} from "@bs42/email"

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME
const RESET_PASSWORD_TOKEN_EXPIRATON = process.env
  .RESET_PASSWORD_TOKEN_EXPIRATON
  ? Number(process.env.RESET_PASSWORD_TOKEN_EXPIRATON)
  : 1800
const SESSION_CACHE_EXPIRATION = process.env.SESSION_CACHE_EXPIRATION
  ? Number(process.env.SESSION_CACHE_EXPIRATION)
  : 300
const INVITATION_EXPIRATON = process.env.INVITATION_EXPIRATON
  ? Number(process.env.INVITATION_EXPIRATON)
  : 1800
const APP_URL = process.env.NEXT_PUBLIC_ADMIN_URL
export function createAuth(baseURL?: string) {
  return betterAuth({
    baseURL: baseURL ?? "http://localhost:3000",
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      autoSignIn: true,
      minPasswordLength: 6,
      maxPasswordLength: 128,
      resetPasswordTokenExpiresIn: RESET_PASSWORD_TOKEN_EXPIRATON,
      sendResetPassword: async ({ user, url }) => {
        const resetUrl = new URL(url)
        const callbackURL = resetUrl.searchParams.get("callbackURL")

        let action = "reset"

        if (callbackURL) {
          try {
            const callbackUrl = new URL(callbackURL, resetUrl.origin)
            action = callbackUrl.searchParams.get("action") || "reset"
          } catch (error) {
            console.error("Failed to parse callbackURL:", error)
          }
        }

        if (action === "set") {
          await sendEmail({
            to: user.email,
            subject: `You've been invited to ${APP_NAME} — set your password`,
            reactTemplate: SetPasswordEmail({
              name: user.name,
              url,
            }),
          })
        } else {
          await sendEmail({
            to: user.email,
            subject: `Reset your ${APP_NAME} password`,
            reactTemplate: ResetPasswordEmail({ name: user.name, url }),
          })
        }
      },
      onPasswordReset: async ({ user }) => {
        await sendEmail({
          to: user.email,
          subject: "Your password has been updated!",
          reactTemplate: PasswordUpdatedEmail({ name: user.name }),
        })
      },
      revokeSessionsOnPasswordReset: true,
    },
    session: {
      cookieCache: {
        enabled: true,
        maxAge: SESSION_CACHE_EXPIRATION,
      },
    },
    advanced: {
      database: {
        generateId: false,
      },

      // crossSubDomainCookies: {
      //   enabled: true,
      //   domain: process.env.COOKIE_DOMAIN,
      // },
    },
    plugins: [
      admin({
        ac: systemAccessController,
        roles: systemRoles,
      }),
      organization({
        ac: storeAccessController,
        roles: storeRoles,
        invitationExpiresIn: INVITATION_EXPIRATON,
        async sendInvitationEmail(data) {
          const inviteLink = `${APP_URL}/accept-invitation/${data.id}`

          await sendEmail({
            to: data.email,
            subject: `You've been invited to join ${data.organization.name} on ${APP_NAME}`,
            reactTemplate: InviteMemberEmail({
              inviterName: data.inviter.user.name,
              name: data.email,
              storeName: data.organization.name,
              role: data.role,
              url: inviteLink,
            }),
          })
        },

        organizationHooks: {
          afterCreateOrganization: async ({ organization, user }) => {
            // Fix the creator's role — better-auth assigns owner by default
            // but admin users should only get admin org role
            const creator = await prisma.user.findUnique({
              where: { id: user.id },
              select: { role: true },
            })

            if (creator?.role === "admin") {
              // Downgrade creator from owner to admin
              await prisma.member.updateMany({
                where: {
                  userId: user.id,
                  organizationId: organization.id,
                },
                data: { role: "admin" },
              })
            }

            // Fetch all other system admins
            const systemAdmins = await prisma.user.findMany({
              where: {
                role: { in: ["superAdmin", "admin"] },
                id: { not: user.id },
              },
            })

            // Add all other system admins as members of the new org
            await prisma.member.createMany({
              data: systemAdmins.map((systemAdmin) => ({
                userId: systemAdmin.id,
                organizationId: organization.id,
                role: systemAdmin.role === "superAdmin" ? "owner" : "admin",
              })),
              skipDuplicates: true,
            })
          },
        },
        schema: {
          organization: {
            additionalFields: {
              plan: {
                type: "string",
                input: true,
                required: true,
              },
              status: {
                type: "string",
                input: true,
                required: true,
              },
            },
          },
        },
      }),
      nextCookies(),
    ],
  })
}

export const auth = createAuth()
