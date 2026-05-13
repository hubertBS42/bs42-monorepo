"use client"
import InputField from "@bs42/ui/components/input-field"
import SelectField from "@bs42/ui/components/select-field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@bs42/ui/components/card"
import { FieldGroup } from "@bs42/ui/components/field"
import { STORE_STATUS_OPTIONS } from "@/constants"
import { authClient } from "@/lib/auth-client"
import { addStoreFormSchema } from "@/lib/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "@bs42/ui/components/sonner"
import ResourceFormHeader from "@/components/resource-form-header"
import ResourceFormFooter from "@/components/resource-form-footer"
import { useTransition } from "react"
import { StoreStatus } from "@/types"
import ImageField from "@bs42/ui/components/image-field"
import { deleteFilesAction, uploadImagesAction } from "@/lib/actions/storage.actions"
import DescriptionField from "@/components/description-field"

const AddStoreForm = () => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof addStoreFormSchema>>({
    resolver: zodResolver(addStoreFormSchema),
    defaultValues: {
      name: "",
      logo: "",
      returnsPolicy: null,
      shippingPolicy: null,
      status: StoreStatus.ACTIVE,
    },
  })

  const onSubmit: SubmitHandler<z.infer<typeof addStoreFormSchema>> = async (storeData) => {
    startTransition(async () => {
      const { error: createOrgErr } = await authClient.organization.create({
        name: storeData.name,
        slug: "undefined",
        logo: !storeData.logo ? undefined : storeData.logo,
        returnsPolicy: storeData.returnsPolicy ?? undefined,
        shippingPolicy: storeData.shippingPolicy ?? undefined,
        status: storeData.status,
        keepCurrentActiveOrganization: true,
      })

      if (createOrgErr) {
        toast.error("Operation failed", { description: createOrgErr.message })
      } else {
        router.push("/stores")
        toast.success("Store created successfully.")
      }
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
      const image = form.getValues("logo")
      if (image?.trim()) await deleteFilesAction([image])
      router.push("/stores")
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-y-6">
        <ResourceFormHeader
          heading="Add Store"
          description="Create a new store to manage members and products."
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
                  <CardDescription>Configure the basic information and settings for your store.</CardDescription>
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
                    />

                    <InputField control={form.control} label="Name" name="name" disabled={isPending} autoFocus />

                    <DescriptionField control={form.control} label="Shipping Policy" name="shippingPolicy" placeholder="Write something..." disabled={isPending} />

                    <DescriptionField control={form.control} label="Returns Policy" name="returnsPolicy" placeholder="Write something..." disabled={isPending} />
                  </FieldGroup>
                </CardContent>
              </Card>
            </div>

            {/* Right column */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
                <CardDescription>Set the status for this store.</CardDescription>
              </CardHeader>
              <CardContent>
                <SelectField control={form.control} name="status" disabled={isPending} loadingPlaceholder="Active" options={STORE_STATUS_OPTIONS} />
              </CardContent>
            </Card>
          </div>

          <ResourceFormFooter backTo="/stores" isPending={isPending} isDirty={form.formState.isDirty} handleDiscard={handleDiscard} />
        </div>
      </div>
    </form>
  )
}

export default AddStoreForm
