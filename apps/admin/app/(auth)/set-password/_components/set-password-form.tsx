"use client"
import PasswordField from "@bs42/ui/components/password-field"
import { Button } from "@bs42/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@bs42/ui/components/card"
import { Field, FieldDescription, FieldGroup } from "@bs42/ui/components/field"
import { Spinner } from "@bs42/ui/components/spinner"
import { authClient } from "@/lib/auth-client"
import { setPasswordFormSchema } from "@/lib/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useState, useTransition } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"

export function SetPasswordForm({
  token,
  action,
}: {
  token: string
  action: string
}) {
  const [isPending, startTransition] = useTransition()
  const [isComplete, setIsComplete] = useState(false)

  const form = useForm<z.infer<typeof setPasswordFormSchema>>({
    resolver: zodResolver(setPasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  })

  const onSubmit: SubmitHandler<z.infer<typeof setPasswordFormSchema>> = async (
    data
  ) => {
    startTransition(async () => {
      await authClient.resetPassword(
        {
          newPassword: data.password,
          token,
        },
        {
          onSuccess: () => {
            startTransition(() => {
              setIsComplete(true)
            })
          },
        }
      )
    })
  }

  function getButtonText(isPending: boolean, action: "set" | "reset") {
    if (isPending)
      return action === "set" ? "Setting password..." : "Resetting password..."
    return action === "set" ? "Set password" : "Reset password"
  }

  if (isComplete) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{`Password ${action === "set" ? "set" : "reset"}`}</CardTitle>
          <CardDescription>{`Your password has been successfully ${action === "set" ? "set" : "reset"}. You can now sign in with this password.`}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href={"/sign-in"}>Sign in</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{`${action === "set" ? "Set" : "Reset"} your password`}</CardTitle>
        <CardDescription>
          Enter your preferred password below to login
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <PasswordField
              control={form.control}
              name="password"
              label="Password"
              disabled={isPending}
              autoFocus
              required
            />

            <PasswordField
              control={form.control}
              name="confirmPassword"
              label="Confirm password"
              disabled={isPending}
              required
            />

            <Field>
              <Button type="submit" disabled={isPending}>
                {isPending && <Spinner />}
                {getButtonText(isPending, action as "set" | "reset")}
              </Button>
              <FieldDescription className="text-center">
                Remember you password? <Link href="/sign-in">Sign in</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
