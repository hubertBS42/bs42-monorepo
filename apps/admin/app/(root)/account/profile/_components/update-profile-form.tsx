"use client"

import { Button } from "@bs42/ui/components/button"
import { FieldGroup } from "@bs42/ui/components/field"
import InputField from "@bs42/ui/components/input-field"
import { Spinner } from "@bs42/ui/components/spinner"
import { updateProfileAction } from "@/lib/actions/account.actions"
import { profileFormSchema } from "@/lib/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTransition } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { toast } from "@bs42/ui/components/sonner"
import { z } from "zod"
import { useRouter } from "next/navigation"

interface UpdateProfileFormProps {
  user: {
    id: string
    name: string
    email: string
    image?: string | null
  }
}

const UpdateProfileForm = ({ user }: UpdateProfileFormProps) => {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      image: user.image ?? "",
    },
  })

  const onSubmit: SubmitHandler<z.infer<typeof profileFormSchema>> = (data) => {
    startTransition(async () => {
      const result = await updateProfileAction({
        name: data.name,
        image: data.image,
      })

      if (!result.success) {
        toast.error("Failed to update profile", { description: result.error })
        return
      }

      toast.success("Profile updated successfully.")
      router.refresh()
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-6">
        <FieldGroup>
          <InputField
            control={form.control}
            name="name"
            label="Name"
            disabled={isPending}
          />
          <InputField
            control={form.control}
            name="email"
            label="Email"
            type="email"
            disabled
          />
          <InputField
            control={form.control}
            name="image"
            label="Avatar URL"
            disabled={isPending}
          />
        </FieldGroup>
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending || !form.formState.isDirty}>
            {isPending ? <Spinner /> : "Save changes"}
          </Button>
        </div>
      </div>
    </form>
  )
}

export default UpdateProfileForm
