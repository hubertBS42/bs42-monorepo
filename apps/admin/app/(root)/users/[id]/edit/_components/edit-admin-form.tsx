"use client"

import { UserDetails } from "@/types"
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
import { deleteFilesAction, restoreFilesAction } from "@/lib/actions/storage.actions"

const EditAdminForm = ({ user }: { user: UserDetails }) => {
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

  const onSubmit: SubmitHandler<z.infer<typeof editAdminFormSchema>> = async (data) => {
    startTransition(async () => {
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

  const handleDiscard = async () => {
    startTransition(async () => {
      const image = form.getValues("image")
      // delete new image
      if (image && !user.image) {
        await deleteFilesAction([image])
      }

      // delete new image and restore previous image
      if (image && user.image && image !== user.image) {
        await deleteFilesAction([image])
        await restoreFilesAction([user.image])
      }

      // restore deleted image
      if (!image && user.image) {
        await restoreFilesAction([user.image])
      }

      router.push("/users")
    })
  }

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
          <UserFormFields control={form.control} user={user} isPending={isPending} clearErrors={form.clearErrors} />

          <ResourceFormFooter backTo="/users" isPending={isPending} isDirty={form.formState.isDirty} handleDiscard={handleDiscard} />
        </div>
      </div>
    </form>
  )
}

export default EditAdminForm
