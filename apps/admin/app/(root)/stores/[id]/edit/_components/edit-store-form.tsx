"use client"
import InputField from "@bs42/ui/components/input-field"
import SelectField from "@bs42/ui/components/select-field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@bs42/ui/components/card"
import { FieldGroup } from "@bs42/ui/components/field"
import { STORE_STATUS_OPTIONS } from "@/constants"
import { authClient } from "@/lib/auth-client"
import { updateStoreFormSchema } from "@/lib/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { toast } from "@bs42/ui/components/sonner"
import { z } from "zod"
import ResourceFormHeader from "@/components/resource-form-header"
import ResourceFormFooter from "@/components/resource-form-footer"
import { Store, StoreStatus } from "@/types"
import { deleteFilesAction, restoreFilesAction, uploadImagesAction } from "@/lib/actions/storage.actions"
import ImageField from "@bs42/ui/components/image-field"
import dynamic from "next/dynamic"
import ButtonSkeleton from "@bs42/ui/components/button-skeleton"
import DescriptionField from "@/components/description-field"

const DeleteStore = dynamic(() => import("./delete-store"), {
  ssr: false,
  loading: () => <ButtonSkeleton />,
})

const EditStoreForm = ({ store }: { store: Store }) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof updateStoreFormSchema>>({
    resolver: zodResolver(updateStoreFormSchema),
    defaultValues: {
      id: store.id,
      name: store.name,
      logo: store.logo ?? "",
      returnsPolicy: store.returnsPolicy,
      shippingPolicy: store.shippingPolicy,
      status: store.status as StoreStatus,
    },
  })

  const onSubmit: SubmitHandler<z.infer<typeof updateStoreFormSchema>> = async (storeData) => {
    startTransition(async () => {
      const { error: updateStoreErr } = await authClient.organization.update({
        data: {
          name: storeData.name,
          logo: storeData.logo,
          returnsPolicy: storeData.returnsPolicy ?? "",
          shippingPolicy: storeData.shippingPolicy ?? "",
          status: storeData.status,
        },
        organizationId: store.id,
      })

      if (updateStoreErr) {
        toast.error("Operation failed", { description: updateStoreErr.message })
        return
      }

      toast.success("Store updated successfully.")
      router.push("/stores")
    })
  }
  const handleAddLogo = async (data: FileList) => {
    const formData = new FormData()
    Array.from(data).forEach((file) => formData.append("files", file))
    return uploadImagesAction(formData)
  }

  const handleRemoveLogo = async (url: string) => {
    await deleteFilesAction([url])
  }
  const handleDiscard = async () => {
    startTransition(async () => {
      const logo = form.getValues("logo")
      // delete new logo
      if (logo && !store.logo) {
        await deleteFilesAction([logo])
      }

      // delete new logo and restore previous logo
      if (logo && store.logo && logo !== store.logo) {
        await deleteFilesAction([logo])
        await restoreFilesAction([store.logo])
      }

      // restore deleted logo
      if (!logo && store.logo) {
        await restoreFilesAction([store.logo])
      }

      router.push("/stores")
    })
  }
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-y-6">
        <ResourceFormHeader
          heading="Edit Store"
          description="Update store's details and status."
          backTo="/stores"
          isPending={isPending}
          isDirty={form.formState.isDirty}
          handleDiscard={handleDiscard}
        />

        <div className="grid gap-8">
          <div className="grid items-start gap-4 lg:grid-cols-3">
            {/* Left column */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Store Details</CardTitle>
                  <CardDescription>Configure the basic information and settings for this store.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <ImageField
                      control={form.control}
                      name="logo"
                      sizeLimit={100}
                      maxImages={1}
                      onAdd={handleAddLogo}
                      onRemove={handleRemoveLogo}
                      clearErrors={form.clearErrors}
                      label="Logo"
                      disabled={isPending}
                      className="max-w-25"
                      defaultValues={store.logo}
                    />
                    <InputField control={form.control} label="Name" name="name" disabled={isPending} autoFocus />

                    <DescriptionField control={form.control} label="Shipping Policy" name="shippingPolicy" placeholder="Write something..." disabled={isPending} />

                    <DescriptionField control={form.control} label="Returns Policy" name="returnsPolicy" placeholder="Write something..." disabled={isPending} />
                  </FieldGroup>
                </CardContent>
              </Card>
            </div>

            {/* Right column */}
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                  <CardDescription>Set the status for this store.</CardDescription>
                </CardHeader>
                <CardContent>
                  <SelectField control={form.control} name="status" disabled={isPending} loadingPlaceholder="Active" options={STORE_STATUS_OPTIONS} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Danger Zone</CardTitle>
                  <CardDescription>Permanently delete this organization and all associated data.</CardDescription>
                </CardHeader>
                <CardContent>
                  <DeleteStore store={store} />
                </CardContent>
              </Card>
            </div>
          </div>
          <ResourceFormFooter backTo="/stores" isPending={isPending} isDirty={form.formState.isDirty} handleDiscard={handleDiscard} />
        </div>
      </div>
    </form>
  )
}

export default EditStoreForm
