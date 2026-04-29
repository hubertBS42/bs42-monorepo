"use client"

import { Button } from "@bs42/ui/components/button"
import { FieldGroup } from "@bs42/ui/components/field"
import InputField from "@bs42/ui/components/input-field"
import { Spinner } from "@bs42/ui/components/spinner"
import { updatePasswordAction } from "@/lib/actions/account.actions"
import { updatePasswordFormSchema } from "@/lib/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTransition } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { toast } from "@bs42/ui/components/sonner"
import { z } from "zod"

const UpdatePasswordForm = () => {
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof updatePasswordFormSchema>>({
    resolver: zodResolver(updatePasswordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const onSubmit: SubmitHandler<z.infer<typeof updatePasswordFormSchema>> = (
    data
  ) => {
    startTransition(async () => {
      const result = await updatePasswordAction({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })

      if (!result.success) {
        if (result.error === "Invalid password") {
          form.setError("currentPassword", {
            type: "custom",
            message: "Current password is incorrect",
          })
        } else {
          toast.error("Failed to update password", {
            description: result.error,
          })
        }
        return
      }

      toast.success("Password updated successfully.")
      form.reset()
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-6">
        <FieldGroup>
          <InputField
            control={form.control}
            name="currentPassword"
            label="Current Password"
            type="password"
            disabled={isPending}
          />
          <InputField
            control={form.control}
            name="newPassword"
            label="New Password"
            type="password"
            disabled={isPending}
          />
          <InputField
            control={form.control}
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            disabled={isPending}
          />
        </FieldGroup>
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending || !form.formState.isDirty}>
            {isPending ? <Spinner /> : "Update password"}
          </Button>
        </div>
      </div>
    </form>
  )
}

export default UpdatePasswordForm
