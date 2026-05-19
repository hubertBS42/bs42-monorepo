"use client"

import { StoreForSelect, UserDetails } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form"
import { toast } from "@bs42/ui/components/sonner"
import { z } from "zod"
import { editStoreUserFormSchema } from "@/lib/zod"
import { Button } from "@bs42/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@bs42/ui/components/card"
import SelectField from "@bs42/ui/components/select-field"
import { STORE_ROLE_NAMES, StoreRole } from "@bs42/auth"
import { capitalizeFirstLetter } from "@bs42/utils"
import { Plus, Trash2 } from "lucide-react"
import UserFormFields from "./user-form-fields"
import ResourceFormHeader from "@/components/resource-form-header"
import ResourceFormFooter from "@/components/resource-form-footer"
import { Badge } from "@bs42/ui/components/badge"
import { updateUserAction } from "@/lib/actions/user.actions"
import { deleteImages, restoreImages } from "@/lib/storage"

const EditStoreUserForm = ({ user, stores }: { user: UserDetails; stores: StoreForSelect[] }) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [removedMembers, setRemovedMembers] = useState<{ memberId: string; storeId: string }[]>([])

  const form = useForm<z.infer<typeof editStoreUserFormSchema>>({
    resolver: zodResolver(editStoreUserFormSchema) as never,
    defaultValues: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image ?? "",
      phone: user.phone,
      dob: user.dob,
      getMarketingEmails: user.getMarketingEmails,
      getSecurityEmails: user.getSecurityEmails,
      getOrderEmails: user.getOrderEmails,
      stores: user.members
        .sort((a, b) => a.organization.name.localeCompare(b.organization.name))
        .map((m) => ({
          memberId: m.id,
          storeId: m.organizationId,
          storeRole: m.role as StoreRole,
          isNew: false,
        })),
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "stores",
  })

  const storeRoleOptions = STORE_ROLE_NAMES.filter((item) => item !== "owner").map((role) => ({ label: capitalizeFirstLetter(role), value: role }))

  const handleRemove = (index: number) => {
    const field = fields[index]
    if (field && field.memberId) {
      setRemovedMembers((prev) => [...prev, { memberId: field.memberId!, storeId: field.storeId }])
    }
    remove(index)
  }

  const onSubmit: SubmitHandler<z.infer<typeof editStoreUserFormSchema>> = async (data) => {
    startTransition(async () => {
      const result = await updateUserAction({
        id: data.id,
        email: data.email,
        name: data.name,
        image: data.image,
        phone: data.phone ?? null,
        dob: data.dob ?? null,
        getMarketingEmails: data.getMarketingEmails,
        getOrderEmails: data.getOrderEmails,
        getSecurityEmails: data.getSecurityEmails,
        stores: data.stores,
        removedMembers: removedMembers,
      })

      if (!result.success) {
        toast.error("Failed to update user", { description: result.error })
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
        await deleteImages([image])
      }

      // delete new image and restore previous image
      if (image && user.image && image !== user.image) {
        await deleteImages([image])
        await restoreImages([user.image])
      }

      // restore deleted image
      if (!image && user.image) {
        await restoreImages([user.image])
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
          <div className="grid gap-4">
            <UserFormFields control={form.control} user={user} isPending={isPending} clearErrors={form.clearErrors} />

            <div className="grid lg:grid-cols-3">
              <div className="lg:col-span-2">
                {/* Organizations card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Stores</CardTitle>
                    <CardDescription>Manage this user&apos;s store memberships</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    {fields.map((field, index) => {
                      const availableStoreOptions = stores
                        .filter((store) => !fields.some((_, i) => i !== index && form.getValues(`stores.${i}.storeId`) === store.id))
                        .map((store) => ({ label: store.name, value: store.id }))
                      return (
                        <div key={field.id} className="grid grid-cols-2 items-end gap-4">
                          <SelectField
                            control={form.control}
                            label="Store"
                            name={`stores.${index}.storeId`}
                            options={availableStoreOptions}
                            disabled={isPending || !field.isNew}
                            loadingPlaceholder="Select Store"
                          />
                          <div className="flex items-end gap-2">
                            <div className="flex-1">
                              {field.storeRole === "owner" ? (
                                // Show read-only badge for owners
                                <div className="grid gap-1.5">
                                  <p className="text-sm font-medium">Member Role</p>
                                  <div className="flex h-9 items-center">
                                    <Badge variant="default">Owner</Badge>
                                  </div>
                                </div>
                              ) : (
                                <SelectField
                                  control={form.control}
                                  label="Member Role"
                                  name={`stores.${index}.storeRole`}
                                  options={storeRoleOptions}
                                  disabled={isPending}
                                  loadingPlaceholder="Member"
                                />
                              )}
                            </div>
                            <Button type="button" variant="outline" size="icon" onClick={() => handleRemove(index)} disabled={isPending} className="mb-0.5 shrink-0">
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        append({
                          memberId: undefined,
                          storeId: stores.find((store) => !fields.map((f) => f.storeId).includes(store.id))?.id ?? "",
                          storeRole: "member",
                          isNew: true,
                        })
                      }
                      disabled={isPending || fields.length >= stores.length}
                      className="w-full"
                    >
                      <Plus className="size-4" />
                      Add Store
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <ResourceFormFooter backTo="/users" isPending={isPending} isDirty={form.formState.isDirty} handleDiscard={handleDiscard} />
        </div>
      </div>
    </form>
  )
}

export default EditStoreUserForm
