"use client"
import { Button } from "@bs42/ui/components/button"
import { Field, FieldGroup } from "@bs42/ui/components/field"
import PasswordField from "@bs42/ui/components/password-field"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { SubmitHandler, useForm } from "react-hook-form"
import InputField from "@bs42/ui/components/input-field"
import { useTransition } from "react"
import { toast } from "@bs42/ui/components/sonner"
import { Spinner } from "@bs42/ui/components/spinner"
import { signUpFormSchema } from "@/lib/zod"
import { APP_URL } from "@/constants"
import { useRouter } from "next/navigation"
import { userSignUpAction } from "@/lib/actions/user.actions"

interface SignUpFormProps {
  callbackURL: string
  email?: string
}

export function SignUpForm({ callbackURL, email }: SignUpFormProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<z.infer<typeof signUpFormSchema>>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      fullName: "",
      email: email ?? "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  })

  const onSubmit: SubmitHandler<z.infer<typeof signUpFormSchema>> = async (
    data
  ) => {
    startTransition(async () => {
      const response = await userSignUpAction({
        name: data.fullName,
        email: data.email,
        password: data.password,
        callbackURL: callbackURL || APP_URL,
      })

      if (!response.success) {
        toast.error(response.error)
        return
      }

      toast.success("Account created successfully.")
      router.push(callbackURL || "/")
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Create an account by filling out the form below
          </p>
        </div>

        <InputField
          control={form.control}
          name="fullName"
          label="Full name"
          placeholder="John Smith"
          disabled={isPending}
          required
          autoFocus
        />
        <InputField
          control={form.control}
          name="email"
          label="Email"
          placeholder="johnsmith@example.com"
          disabled={isPending || !!email}
          type="email"
          required
        />
        <PasswordField
          control={form.control}
          name="password"
          label="Password"
          disabled={isPending}
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
            {isPending ? "Creating account..." : "Create account"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
