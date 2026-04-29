"use client"
import InputField from "@bs42/ui/components/input-field"
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
import { requestPasswordResetAction } from "@/lib/actions/user.actions"
import { resetPasswordFormSchema } from "@/lib/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import React, { useState, useTransition } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"

export function ResetPasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [isComplete, setIsComplete] = useState(false)

  const form = useForm<z.infer<typeof resetPasswordFormSchema>>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  })

  const onSubmit: SubmitHandler<
    z.infer<typeof resetPasswordFormSchema>
  > = async (data) => {
    startTransition(async () => {
      const response = await requestPasswordResetAction({
        email: data.email,
        redirectTo: "/set-password?action=reset",
        actor: "self",
      })

      if (response.success) {
        startTransition(() => {
          setIsComplete(true)
        })
      }
    })
  }

  if (isComplete) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset link sent</CardTitle>
          <CardDescription>
            Thank you. If an account with that email exists, we&apos;ve sent a
            password reset link to your inbox.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href={"/"}>Go home</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Forgot your password</CardTitle>
        <CardDescription>
          Enter your email below to reset your password
        </CardDescription>
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
            <Field>
              <Button type="submit" disabled={isPending}>
                {isPending && <Spinner />}
                {isPending ? "Processing..." : "Reset password"}
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
