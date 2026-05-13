"use client"
import InputField from "@bs42/ui/components/input-field"
import SelectField from "@bs42/ui/components/select-field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@bs42/ui/components/card"
import { FieldGroup } from "@bs42/ui/components/field"
import { CATEGORY_STATUS_OPTIONS } from "@/constants"
import { addCategoryFormSchema } from "@/lib/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "@bs42/ui/components/sonner"
import ResourceFormHeader from "@/components/resource-form-header"
import ResourceFormFooter from "@/components/resource-form-footer"
import { useMemo, useTransition } from "react"
import ImageField from "@bs42/ui/components/image-field"
import SelectTreeField from "@bs42/ui/components/select-tree-field"
import { deleteFilesAction, uploadImagesAction } from "@/lib/actions/storage.actions"
import { Status } from "@bs42/db/enums"
import { createCategoryAction } from "@/lib/actions/category.actions"
import { buildNodeTree } from "@bs42/utils"
import TextAreaField from "@bs42/ui/components/textarea-field"
import SwitchCardField from "@bs42/ui/components/switch-card-field"
import { CategoryForSelect } from "@/types"

const AddCategoryForm = ({ categories }: { categories: CategoryForSelect[] }) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof addCategoryFormSchema>>({
    resolver: zodResolver(addCategoryFormSchema),
    defaultValues: {
      name: "",
      image: "",
      description: "",
      isFeatured: false,
      status: Status.DRAFT,
      parentId: "null",
    },
  })

  const categoryOptions = useMemo(() => {
    const mappedCategories = categories.map((category) => ({
      label: category.name,
      value: category.id,
      id: category.id,
      parentId: category.parentId,
    }))
    return [{ label: "- No parent -", value: "null", parentId: null, id: "" }, ...buildNodeTree(mappedCategories)]
  }, [categories])

  const onSubmit: SubmitHandler<z.infer<typeof addCategoryFormSchema>> = async (categoryData) => {
    startTransition(async () => {
      const response = await createCategoryAction(categoryData)

      if (!response.success) {
        toast.error("Operation failed", { description: response.error })
      } else {
        toast.success("Category was successfully created.")
        router.push("/catalogue/categories")
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
      const image = form.getValues("image")
      if (image?.trim()) await deleteFilesAction([image])
      router.push("/catalogue/categories")
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-y-6">
        <ResourceFormHeader
          heading="Add Category"
          description="Create a new product category."
          backTo="/catalogue/categories"
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
                  <CardTitle>Category Details</CardTitle>
                  <CardDescription>Configure the basic information this category.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <ImageField
                      control={form.control}
                      name="image"
                      sizeLimit={100}
                      maxImages={1}
                      onAdd={handleAddLogo}
                      onRemove={handleRemoveLogo}
                      clearErrors={form.clearErrors}
                      label="Image"
                      disabled={isPending}
                      className="max-w-25"
                    />

                    <InputField control={form.control} label="Name" name="name" disabled={isPending} autoFocus />

                    <SelectTreeField
                      control={form.control}
                      name="parentId"
                      label="Parent category"
                      options={categoryOptions}
                      disabled={isPending}
                      loadingPlaceholder="- No parent -"
                    />

                    <TextAreaField control={form.control} label="Description" name="description" disabled={isPending} />
                  </FieldGroup>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                  <CardDescription>Settings for this category.</CardDescription>
                </CardHeader>
                <CardContent>
                  <SwitchCardField control={form.control} label="Featured" name="isFeatured" disabled={isPending} description="Show this category in featured sections" />
                </CardContent>
              </Card>
            </div>

            {/* Right column */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
                <CardDescription>Set the status for this category.</CardDescription>
              </CardHeader>
              <CardContent>
                <SelectField control={form.control} name="status" disabled={isPending} loadingPlaceholder="Draft" options={CATEGORY_STATUS_OPTIONS} />
              </CardContent>
            </Card>
          </div>

          <ResourceFormFooter backTo="/catalogue/categories" isPending={isPending} isDirty={form.formState.isDirty} handleDiscard={handleDiscard} />
        </div>
      </div>
    </form>
  )
}

export default AddCategoryForm
