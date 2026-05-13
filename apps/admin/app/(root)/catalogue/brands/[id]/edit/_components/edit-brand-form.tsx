"use client"
import InputField from "@bs42/ui/components/input-field"
import SelectField from "@bs42/ui/components/select-field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@bs42/ui/components/card"
import { FieldGroup } from "@bs42/ui/components/field"
import { updateBrandFormSchema } from "@/lib/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "@bs42/ui/components/sonner"
import ResourceFormHeader from "@/components/resource-form-header"
import ResourceFormFooter from "@/components/resource-form-footer"
import { useTransition } from "react"
import { updateBrandAction } from "@/lib/actions/brand.actions"
import { deleteFilesAction, restoreFilesAction, uploadImagesAction } from "@/lib/actions/storage.actions"
import ImageField from "@bs42/ui/components/image-field"
import TextAreaField from "@bs42/ui/components/textarea-field"
import SwitchCardField from "@bs42/ui/components/switch-card-field"
import { BRAND_STATUS_OPTIONS } from "@/constants"
import { Brand, Status } from "@bs42/db/client"
import dynamic from "next/dynamic"
import ButtonSkeleton from "@bs42/ui/components/button-skeleton"

const DeleteBrand = dynamic(() => import("./delete-brand"), {
  ssr: false,
  loading: () => <ButtonSkeleton />,
})

const EditBrandForm = ({ brand }: { brand: Brand }) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof updateBrandFormSchema>>({
    resolver: zodResolver(updateBrandFormSchema),
    defaultValues: {
      id: brand.id,
      name: brand.name,
      logo: brand.logo ?? "",
      description: brand.description,
      isFeatured: brand.isFeatured,
      status: brand.status as Status,
      website: brand.website ?? "",
    },
  })

  const onSubmit: SubmitHandler<z.infer<typeof updateBrandFormSchema>> = async (brandData) => {
    startTransition(async () => {
      const response = await updateBrandAction(brandData)

      if (!response.success) {
        if (response.error === "Field already exists") {
          form.setError("name", {
            type: "custom",
            message: "A brand with this name already exists.",
          })
        } else {
          toast.error("Operation failed", { description: response.error })
        }
      } else {
        toast.success("Brand was successfully updated.")
        router.push("/catalogue/brands")
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
      const logo = form.getValues("logo")
      // delete new logo
      if (logo && !brand.logo) {
        await deleteFilesAction([logo])
      }

      // delete new logo and restore previous logo
      if (logo && brand.logo && logo !== brand.logo) {
        await deleteFilesAction([logo])
        await restoreFilesAction([brand.logo])
      }

      // restore deleted logo
      if (!logo && brand.logo) {
        await restoreFilesAction([brand.logo])
      }

      router.push("/catalogue/brands")
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-y-6">
        <ResourceFormHeader
          heading="Edit Brand"
          description="Edit this product brand."
          backTo="/catalogue/brands"
          isPending={isPending}
          isDirty={form.formState.isDirty}
          handleDiscard={handleDiscard}
        />

        <div className="grid gap-8">
          <div className="grid items-start gap-4 lg:grid-cols-3">
            {/* Left column */}
            <div className="grid gap-4 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Brand Details</CardTitle>
                  <CardDescription>Configure the basic information this brand.</CardDescription>
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
                      defaultValues={brand.logo}
                    />

                    <InputField control={form.control} label="Name" name="name" disabled={isPending} autoFocus />

                    <InputField control={form.control} label="Website" name="website" disabled={isPending} />
                    <TextAreaField control={form.control} label="Description" name="description" disabled={isPending} />
                  </FieldGroup>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                  <CardDescription>Settings for this brand.</CardDescription>
                </CardHeader>
                <CardContent>
                  <SwitchCardField control={form.control} label="Featured" name="isFeatured" disabled={isPending} description="Show this brand in featured sections" />
                </CardContent>
              </Card>
            </div>

            {/* Right column */}
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                  <CardDescription>Set the status for this brand.</CardDescription>
                </CardHeader>
                <CardContent>
                  <SelectField control={form.control} name="status" disabled={isPending} loadingPlaceholder="Draft" options={BRAND_STATUS_OPTIONS} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Danger Zone</CardTitle>
                  <CardDescription>Permanently delete this organization and all associated data.</CardDescription>
                </CardHeader>
                <CardContent>
                  <DeleteBrand brand={brand} />
                </CardContent>
              </Card>
            </div>
          </div>

          <ResourceFormFooter backTo="/catalogue/brands" isPending={isPending} isDirty={form.formState.isDirty} handleDiscard={handleDiscard} />
        </div>
      </div>
    </form>
  )
}

export default EditBrandForm
