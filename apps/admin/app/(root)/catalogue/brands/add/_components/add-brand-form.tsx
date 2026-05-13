"use client"
import InputField from "@bs42/ui/components/input-field"
import SelectField from "@bs42/ui/components/select-field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@bs42/ui/components/card"
import { FieldGroup } from "@bs42/ui/components/field"
import { addBrandFormSchema } from "@/lib/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "@bs42/ui/components/sonner"
import ResourceFormHeader from "@/components/resource-form-header"
import ResourceFormFooter from "@/components/resource-form-footer"
import { useTransition } from "react"
import { createBrandAction } from "@/lib/actions/brand.actions"
import { deleteFilesAction, uploadImagesAction } from "@/lib/actions/storage.actions"
import ImageField from "@bs42/ui/components/image-field"
import TextAreaField from "@bs42/ui/components/textarea-field"
import SwitchCardField from "@bs42/ui/components/switch-card-field"
import { BRAND_STATUS_OPTIONS } from "@/constants"
import { Status } from "@bs42/db/enums"

const AddBrandForm = () => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof addBrandFormSchema>>({
    resolver: zodResolver(addBrandFormSchema),
    defaultValues: {
      name: "",
      logo: "",
      description: "",
      isFeatured: false,
      status: Status.DRAFT,
      website: "",
    },
  })

  const onSubmit: SubmitHandler<z.infer<typeof addBrandFormSchema>> = async (brandData) => {
    startTransition(async () => {
      const response = await createBrandAction(brandData)

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
        toast.success("Brand was successfully created.")
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
      const image = form.getValues("logo")
      if (image?.trim()) await deleteFilesAction([image])
      router.push("/catalogue/brands")
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-y-6">
        <ResourceFormHeader
          heading="Create Brand"
          description="Create a new product brand."
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
                  <CardDescription>Configure the basic information for this brand.</CardDescription>
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
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
                <CardDescription>Set the status for this brand.</CardDescription>
              </CardHeader>
              <CardContent>
                <SelectField control={form.control} name="status" disabled={isPending} loadingPlaceholder="Draft" options={BRAND_STATUS_OPTIONS} />
              </CardContent>
            </Card>
          </div>

          <ResourceFormFooter backTo="/catalogue/brands" isPending={isPending} isDirty={form.formState.isDirty} handleDiscard={handleDiscard} />
        </div>
      </div>
    </form>
  )
}

export default AddBrandForm
