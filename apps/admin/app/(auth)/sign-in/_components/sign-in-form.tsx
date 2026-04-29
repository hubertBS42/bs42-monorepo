"use client"
import { Button } from "@bs42/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@bs42/ui/components/card"
import { FieldGroup } from "@bs42/ui/components/field"
import { signInFormSchema } from "@/lib/zod"
import { useTransition } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { authClient } from "@/lib/auth-client"
import { APP_URL } from "@/constants"
import { toast } from "@bs42/ui/components/sonner"
import { Spinner } from "@bs42/ui/components/spinner"
import InputField from "@bs42/ui/components/input-field"
import PasswordField from "@bs42/ui/components/password-field"
import Link from "next/link"

export function SignInForm({ callbackURL }: { callbackURL: string }) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof signInFormSchema>>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit: SubmitHandler<z.infer<typeof signInFormSchema>> = async (
    data
  ) => {
    startTransition(async () => {
      await authClient.signIn.email(
        {
          email: data.email,
          password: data.password,
          callbackURL: callbackURL || APP_URL,
        },
        {
          onError: (ctx) => {
            toast.error("Sign in failed", {
              position: "top-left",
              description: ctx.error.message,
              richColors: true,
            })
          },
          onSuccess: async (ctx) => {
            console.log(ctx)
            const { role } = ctx.data.user
            if (role === "superAdmin" || role === "admin") {
              // Platform staff → Global workspace
              await authClient.organization.setActive({
                organizationSlug: "global",
              })
            } else {
              // Regular users → their own org
              const { data: orgs } = await authClient.organization.list()
              if (!orgs || orgs.length === 0) return
              await authClient.organization.setActive({
                organizationId: orgs[0]?.id ?? null,
              })
            }
          },
        }
      )
    })
  }
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>Login into your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <InputField
              control={form.control}
              name="email"
              label="Email"
              placeholder="john@example.com"
              type="email"
              disabled={isPending}
              autoFocus
              required
            />

            <PasswordField
              control={form.control}
              name="password"
              label="Password"
              disabled={isPending}
              resetPasswordSlot={
                <Link
                  href="/reset-password"
                  className="text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </Link>
              }
              required
            />

            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner />}
              {isPending ? "Signing in..." : "Sign in"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
