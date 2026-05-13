"use client"
import InputField from "@bs42/ui/components/input-field"
import SelectField from "@bs42/ui/components/select-field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@bs42/ui/components/card"
import { FieldGroup } from "@bs42/ui/components/field"
import { CATEGORY_STATUS_OPTIONS } from "@/constants"
import { updateCategoryFormSchema } from "@/lib/zod"
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
import { deleteFilesAction, restoreFilesAction, uploadImagesAction } from "@/lib/actions/storage.actions"
import { Status } from "@bs42/db/enums"
import { updateCategoryAction } from "@/lib/actions/category.actions"
import { Category } from "@bs42/db/client"
import { buildNodeTree, collectDescendantIds } from "@bs42/utils"
import TextAreaField from "@bs42/ui/components/textarea-field"
import SwitchCardField from "@bs42/ui/components/switch-card-field"
import ButtonSkeleton from "@bs42/ui/components/button-skeleton"
import dynamic from "next/dynamic"
import { CategoryForSelect } from "@/types"

const DeleteCategory = dynamic(() => import("./delete-category"), {
  ssr: false,
  loading: () => <ButtonSkeleton />,
})

interface EditCategoryFormProps {
  category: Category
  categories: CategoryForSelect[]
}

const EditCategoryForm = ({ category, categories }: EditCategoryFormProps) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof updateCategoryFormSchema>>({
    resolver: zodResolver(updateCategoryFormSchema),
    defaultValues: {
      id: category.id,
      name: category.name,
      image: category.image ?? "",
      description: category.description,
      isFeatured: category.isFeatured,
      status: category.status as Status,
      parentId: category.parentId ?? "null",
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

  const genDisabledCategoryOptions = () => collectDescendantIds(categories, category.id)

  const parentCategory = categories.find((item) => item.id === category.parentId)

  const onSubmit: SubmitHandler<z.infer<typeof updateCategoryFormSchema>> = async (categoryData) => {
    startTransition(async () => {
      const response = await updateCategoryAction(categoryData)

      if (!response.success) {
        toast.error("Operation failed", { description: response.error })
      } else {
        toast.success("Category was successfully updated.")
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
      // delete new image
      if (image && !category.image) {
        await deleteFilesAction([image])
      }

      // delete new image and restore previous image
      if (image && category.image && image !== category.image) {
        await deleteFilesAction([image])
        await restoreFilesAction([category.image])
      }

      // restore deleted image
      if (!image && category.image) {
        await restoreFilesAction([category.image])
      }

      router.push("/catalogue/categories")
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-y-6">
        <ResourceFormHeader
          heading="Edit Category"
          description="Edit this product category."
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
                      defaultValues={category.image}
                    />

                    <InputField control={form.control} label="Name" name="name" disabled={isPending} autoFocus />

                    <SelectTreeField
                      control={form.control}
                      name="parentId"
                      label="Parent category"
                      options={categoryOptions}
                      disabled={isPending}
                      disabledOptions={genDisabledCategoryOptions()}
                      loadingPlaceholder={parentCategory?.name || "- No parent -"}
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
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                  <CardDescription>Set the status for this category.</CardDescription>
                </CardHeader>
                <CardContent>
                  <SelectField control={form.control} name="status" disabled={isPending} loadingPlaceholder="Draft" options={CATEGORY_STATUS_OPTIONS} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Danger Zone</CardTitle>
                  <CardDescription>Permanently delete this category and all associated data.</CardDescription>
                </CardHeader>
                <CardContent>
                  <DeleteCategory category={category} />
                </CardContent>
              </Card>
            </div>
          </div>

          <ResourceFormFooter backTo="/catalogue/categories" isPending={isPending} isDirty={form.formState.isDirty} handleDiscard={handleDiscard} />
        </div>
      </div>
    </form>
  )
}

export default EditCategoryForm
