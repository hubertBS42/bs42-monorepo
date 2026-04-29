"use client"

import { UserWithSessionsAndMemberships } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { toast } from "@bs42/ui/components/sonner"
import { z } from "zod"
import { editAdminFormSchema } from "@/lib/zod"
import UserFormFields from "./user-form-fields"
import ResourceFormHeader from "@/components/resource-form-header"
import ResourceFormFooter from "@/components/resource-form-footer"
import { updateUserAction } from "@/lib/actions/user.actions"

const EditAdminForm = ({ user }: { user: UserWithSessionsAndMemberships }) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof editAdminFormSchema>>({
    resolver: zodResolver(editAdminFormSchema),
    defaultValues: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image ?? "",
    },
  })

  const onSubmit: SubmitHandler<z.infer<typeof editAdminFormSchema>> = async (
    data
  ) => {
    startTransition(async () => {
      console.log(data)
      const result = await updateUserAction({
        id: data.id,
        name: data.name,
        email: data.email,
        image: data.image,
      })

      if (!result.success) {
        toast.error("Failed to user user", { description: result.error })
        return
      }

      toast.success("User successfully updated.")
      router.push("/users")
    })
  }

  const handleDiscard = async () => router.push("/users")

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-y-6">
        <ResourceFormHeader
          heading="Edit User"
          description="Manage user's account."
          backTo="/users"
          isPending={isPending}
          isDirty={form.formState.isDirty}
          handleDiscard={handleDiscard}
        />

        <div className="grid gap-8">
          <UserFormFields
            control={form.control}
            user={user}
            isPending={isPending}
          />

          <ResourceFormFooter
            backTo="/users"
            isPending={isPending}
            isDirty={form.formState.isDirty}
            handleDiscard={handleDiscard}
          />
        </div>
      </div>
    </form>
  )
}

export default EditAdminForm
