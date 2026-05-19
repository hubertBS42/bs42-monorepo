"use client"
import InputField from "@bs42/ui/components/input-field"
import SelectField from "@bs42/ui/components/select-field"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@bs42/ui/components/card"
import { FieldGroup } from "@bs42/ui/components/field"
import { CONDITION_OPTIONS, PRODUCT_STATUS_OPTIONS } from "@/constants"
import { updateProductFormSchema } from "@/lib/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "@bs42/ui/components/sonner"
import ResourceFormHeader from "@/components/resource-form-header"
import ResourceFormFooter from "@/components/resource-form-footer"
import { useMemo, useState, useTransition } from "react"
import ImageField from "@bs42/ui/components/image-field"
import { Condition, Status } from "@bs42/db/enums"
import { updateProductAction } from "@/lib/actions/product.actions"
import { buildNodeTree } from "@bs42/utils"
import NumberField from "@bs42/ui/components/number-field"
import SelectCascaderField from "@bs42/ui/components/select-cascader-field"
import SwitchCardField from "@bs42/ui/components/switch-card-field"
import { Button } from "@bs42/ui/components/button"
import { Pencil, PlusCircle, Trash2, X } from "lucide-react"
import { Label } from "@bs42/ui/components/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@bs42/ui/components/table"
import { Badge } from "@bs42/ui/components/badge"
import DescriptionField from "@/components/description-field"
import { BrandForSelect, CategoryForSelect, ProductDetails } from "@/types"
import dynamic from "next/dynamic"
import ButtonSkeleton from "@bs42/ui/components/button-skeleton"
import VariantSheet from "../../../_components/variant-sheet"
import { generateSKU } from "@/lib/utils"
import InputTagField from "@bs42/ui/components/input-tag-field"
import DocumentField from "@bs42/ui/components/document-field"
import ComboboxField from "@bs42/ui/components/combobox-field"
import { deleteDocuments, deleteFiles, deleteImages, restoreFiles, uploadDocuments, uploadImages } from "@/lib/storage"

interface EditProductFormProps {
  product: ProductDetails
  categories: CategoryForSelect[]
  brands: BrandForSelect[]
}

const DeleteProduct = dynamic(() => import("./delete-product"), {
  ssr: false,
  loading: () => <ButtonSkeleton />,
})

const EditProductForm = ({ product, categories, brands }: EditProductFormProps) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null)

  const form = useForm<z.infer<typeof updateProductFormSchema>>({
    resolver: zodResolver(updateProductFormSchema),
    defaultValues: {
      id: product.id,
      name: product.name,
      description: product.description,
      tags: product.tags,
      documents: product.documents.map((doc) => ({
        id: doc.id,
        name: doc.name,
        url: doc.url,
      })),
      categoryIds: product.categories.map((item) => item.id),
      brandId: product.brandId,
      baseSellPrice: Number(product.baseSellPrice),
      baseBuyPrice: Number(product.baseBuyPrice),
      hasVariants: product.hasVariants,
      status: product.status as Status,
      condition: product.condition as Condition,
      images: product.images,
      sku: product.sku ?? "",
      barcode: product.barcode ?? "",
      weight: product.weight ? Number(product.weight) : 0,
      dimensions: product.dimensions ?? "",
      variantOptions: product.variantOptions,
      variants: product.variants.map((variant) => ({
        ...variant,
        weight: variant.weight ? Number(variant.weight) : 0,
        attributes: Object.fromEntries(variant.variantValues.map((vv) => [vv.optionValue.option.name, vv.optionValue.value])),
      })),
    },
  })

  // Field arrays for variants
  const {
    fields: variantOptionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({
    control: form.control,
    name: "variantOptions",
  })

  const { fields: variantFields, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: "variants",
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const hasVariants = form.watch("hasVariants")
  const productName = form.watch("name")
  const variantOptions = form.watch("variantOptions") || []
  const watchedVariants = form.watch("variants")

  // Generate all variant combinations
  const generateVariants = () => {
    const existingImages = watchedVariants?.flatMap((v) => v.images ?? []) ?? []

    if (existingImages.length) {
      deleteImages(existingImages) // fire and forget
    }
    const combinations: Record<string, string>[] = []
    const optionValues = variantOptions.map((opt) => ({
      name: opt.name,
      values: opt.values.map((v) => v.value),
    }))

    const generateCombinations = (index: number, current: Record<string, string>) => {
      if (index === optionValues.length) {
        combinations.push({ ...current })
        return
      }

      const option = optionValues[index]
      if (!option) return

      for (const value of option.values) {
        current[option.name] = value
        generateCombinations(index + 1, current)
      }
    }

    generateCombinations(0, {})

    const usedSkus = new Set<string>()

    const newVariants = combinations.map((attributes, idx) => {
      let sku = generateSKU(productName!, attributes)

      // Only append suffix if SKU already exists
      if (usedSkus.has(sku)) {
        let count = 1
        while (usedSkus.has(`${sku}-${count}`)) {
          count++
        }
        sku = `${sku}-${count}`
      }

      usedSkus.add(sku)

      return {
        sku,
        barcode: "",
        dimensions: "",
        weight: 0,
        attributes,
        position: idx + 1,
        images: [],
      }
    })

    form.setValue("variants", newVariants)
    form.trigger("variants")
  }

  const categoryOptions = useMemo(() => {
    const mappedCategories = categories.map((category) => ({
      label: category.name,
      value: category.id,
      id: category.id,
      parentId: category.parentId,
    }))
    return buildNodeTree(mappedCategories)
  }, [categories])

  const brandOptions = useMemo(() => {
    return brands.map((brand) => ({
      label: brand.name,
      value: brand.id,
    }))
  }, [brands])

  const onSubmit: SubmitHandler<z.infer<typeof updateProductFormSchema>> = async (productData) => {
    startTransition(async () => {
      const response = await updateProductAction(productData)
      if (!response.success) {
        toast.error("Operation failed", { description: response.error })
      } else {
        toast.success("Product was successfully updated.")
        router.push("/catalogue/products")
      }
    })
  }

  const handleAddImages = async (data: FileList) => {
    const formData = new FormData()
    Array.from(data).forEach((file) => formData.append("files", file))
    return uploadImages(formData)
  }

  const handleRemoveImage = async (url: string) => {
    await deleteImages([url])
  }

  const handleDiscard = async () => {
    startTransition(async () => {
      const formValues = form.getValues()

      const dbFiles = [...product.images]
      const formFiles = [...formValues.images]

      // Collect variant images from form
      if (formValues.variants?.length) {
        formValues.variants.map((v) => {
          if (v.images.length) {
            formFiles.push(...v.images)
          }
        })
      }

      // Collect variant images from db
      if (product.variants?.length) {
        product.variants.map((v) => {
          if (v.images.length) {
            dbFiles.push(...v.images)
          }
        })
      }

      // Collect documents from db
      if (product.documents.length) {
        product.documents.map((d) => dbFiles.push(d.url))
      }

      // Collect documents from form
      if (formValues.documents.length) {
        formValues.documents.map((d) => formFiles.push(d.url))
      }

      const newFiles: string[] = []
      const deletedFiles: string[] = []

      // Detect newly added files
      for (const file of formFiles) {
        if (!dbFiles.includes(file)) {
          newFiles.push(file)
        }
      }

      // Detect deleted images
      for (const file of dbFiles) {
        if (!formFiles.includes(file)) {
          deletedFiles.push(file)
        }
      }

      // Only restore files that were actually deleted
      if (deletedFiles.length) {
        await restoreFiles(deletedFiles)
      }

      // Delete any newly uploaded files
      if (newFiles.length) {
        await deleteFiles(newFiles)
      }

      router.push("/catalogue/products")
    })
  }

  const handleRemoveVariant = async (index: number) => {
    const variant = watchedVariants?.[index]
    if (variant?.images?.length) {
      await deleteImages(variant.images)
    }
    removeVariant(index)
  }

  const handleAddDocuments = async (data: FileList) => {
    const formData = new FormData()
    Array.from(data).forEach((file) => formData.append("files", file))
    return uploadDocuments(formData)
  }

  const handleRemoveDocument = async (url: string) => {
    await deleteDocuments([url])
  }
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-y-6">
        <ResourceFormHeader
          heading="Edit Product"
          description="Edit this product."
          backTo="/catalogue/products"
          isPending={isPending}
          isDirty={form.formState.isDirty}
          handleDiscard={handleDiscard}
        />

        <div className="grid gap-8">
          <div className="grid items-start gap-4 lg:grid-cols-3">
            {/* Left column */}
            <div className="grid auto-rows-max gap-y-4 lg:col-span-2">
              {/* Product Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Details</CardTitle>
                  <CardDescription>Configure the basic information this product.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <InputField control={form.control} label="Name" name="name" disabled={isPending} autoFocus />

                    <DescriptionField control={form.control} label="Description" name="description" placeholder="Provide a description" disabled={isPending} />

                    <div className="grid gap-5 sm:grid-cols-2">
                      <ComboboxField
                        control={form.control}
                        label="Brand"
                        name="brandId"
                        disabled={isPending}
                        options={brandOptions}
                        placeholder="Select brand"
                        searchPlaceholder="Seach brands..."
                      />

                      <SelectField control={form.control} label="Condition" name="condition" disabled={isPending} loadingPlaceholder="New" options={CONDITION_OPTIONS} />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <NumberField control={form.control} label="Buy price" name="baseBuyPrice" step={0.01} prependText="$" disabled={isPending} />
                      <NumberField control={form.control} label="Sell price" name="baseSellPrice" step={0.01} prependText="$" disabled={isPending} />
                    </div>

                    <SelectCascaderField
                      control={form.control}
                      label="Category"
                      name="categoryIds"
                      options={categoryOptions}
                      disabled={isPending}
                      placeholder="Select categories"
                    />

                    <InputTagField control={form.control} label="Tags" name="tags" placeholder="Add tag and press Enter..." disabled={isPending} />
                  </FieldGroup>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                  <CardDescription>Settings for this product.</CardDescription>
                </CardHeader>
                <CardContent>
                  <SwitchCardField
                    control={form.control}
                    label="Has variants"
                    name="hasVariants"
                    disabled={isPending || productName!.trim().length < 3}
                    description="Product has multiple variants (color, size, etc.)"
                    onChange={async (checked) => {
                      if (!checked) {
                        const variantImages = watchedVariants?.flatMap((v) => v.images ?? []) ?? []
                        if (variantImages.length) await deleteImages(variantImages)
                        // Clear variant variantOptions and variants
                        form.setValue("variantOptions", [])
                        form.setValue("variants", [])

                        // Also trigger validation to clear any validation errors
                        form.trigger(["variantOptions", "variants"])
                      } else {
                        // Clear simple product fields when switching to variants
                        form.setValue("sku", "")
                        form.setValue("barcode", "")
                        form.setValue("dimensions", "")
                        form.setValue("weight", 0)
                      }
                    }}
                  />
                </CardContent>
              </Card>

              {/* Shipping Card - Only for products without variants */}
              {!hasVariants && (
                <Card>
                  <CardHeader>
                    <CardTitle>Product Identification & Shipping</CardTitle>
                    <CardDescription>SKU, barcode and shipping details for this product</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FieldGroup>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <InputField control={form.control} label="SKU" name="sku" disabled={isPending} placeholder="e.g. TSHIRT-RED-L" />
                        <InputField control={form.control} label="Barcode" name="barcode" disabled={isPending} placeholder="e.g. 123456789" />
                      </div>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <NumberField control={form.control} label="Weight (kg)" name="weight" step={0.01} disabled={isPending} />
                        <InputField control={form.control} label="Dimensions" name="dimensions" disabled={isPending} placeholder="e.g. 10x5x3 cm" />
                      </div>
                    </FieldGroup>
                  </CardContent>
                </Card>
              )}

              {/* Variant Options Card */}
              {hasVariants && (
                <Card>
                  <CardHeader>
                    <CardTitle>Variant Options</CardTitle>
                    <CardDescription>Define variant types (Color, Size, etc.)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FieldGroup>
                      {variantOptionFields.map((field, optionIndex) => (
                        <div key={field.id} className="rounded-lg border p-4">
                          <div className="mb-4 flex items-center justify-between">
                            <InputField
                              control={form.control}
                              placeholder="Option name (e.g., Color)"
                              name={`variantOptions.${optionIndex}.name`}
                              disabled={isPending}
                              className="max-w-xs"
                            />

                            <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(optionIndex)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <Label>Values</Label>
                            {variantOptions[optionIndex]?.values?.map((v, valueIndex) => (
                              <div key={`${optionIndex}-${valueIndex}`} className="flex gap-2">
                                <InputField
                                  control={form.control}
                                  placeholder="Value (e.g., Red)"
                                  name={`variantOptions.${optionIndex}.values.${valueIndex}.value`}
                                  disabled={isPending}
                                />

                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const current = form.getValues(`variantOptions.${optionIndex}.values`)
                                    form.setValue(
                                      `variantOptions.${optionIndex}.values`,
                                      current?.filter((_, i) => i !== valueIndex)
                                    )
                                  }}
                                >
                                  <X className="size-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const current = form.getValues(`variantOptions.${optionIndex}.values`) || []
                                form.setValue(`variantOptions.${optionIndex}.values`, [...current, { value: "", position: current.length }])
                              }}
                            >
                              <PlusCircle className="mr-2 size-4" />
                              Add Value
                            </Button>
                          </div>
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          appendOption({
                            name: "",
                            position: variantOptionFields.length,
                            values: [],
                          })
                        }
                      >
                        <PlusCircle className="mr-2 size-4" />
                        Add Option
                      </Button>
                    </FieldGroup>
                  </CardContent>
                  <CardFooter className="grid justify-center border-t p-4">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={generateVariants}
                      disabled={!variantOptions?.length || !variantOptions.some((opt) => opt.name.trim() && opt.values.some((v) => v.value.trim()))}
                    >
                      <PlusCircle className="mr-2 size-3.5" />
                      {watchedVariants?.length ? "Regenerate" : "Generate"} Variants
                    </Button>
                    <ul className="list-disc">
                      {form.formState.errors.variants && (
                        <li className="text-sm text-destructive">{form.formState.errors.variants.message ?? form.formState.errors.variants.root?.message}</li>
                      )}
                    </ul>
                  </CardFooter>
                </Card>
              )}

              {/* Variants Table */}
              {hasVariants && variantFields.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Variants</CardTitle>
                    <CardDescription>Manage individual product variants</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Attributes</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Images</TableHead>
                          <TableHead className="w-20"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {variantFields.map((field, index) => {
                          const variant = watchedVariants?.[index]

                          return (
                            <TableRow key={field.id}>
                              <TableCell>
                                <div className="text-sm">
                                  {Object.entries(variant?.attributes || {}).map(([key, value]) => (
                                    <Badge key={key} variant="secondary" className="mr-1">
                                      {key}: {value}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="font-mono text-sm">{variant?.sku}</span>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-muted-foreground">{variant?.images?.length ?? 0} image(s)</span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button type="button" variant="ghost" size="icon" onClick={() => setEditingVariantIndex(index)}>
                                    <Pencil className="size-4" />
                                  </Button>
                                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveVariant(index)}>
                                    <Trash2 className="size-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                    {editingVariantIndex !== null && (
                      <VariantSheet
                        open={editingVariantIndex !== null}
                        onOpenChange={(open) => !open && setEditingVariantIndex(null)}
                        index={editingVariantIndex}
                        control={form.control}
                        attributes={watchedVariants?.[editingVariantIndex]?.attributes ?? {}}
                        images={watchedVariants?.[editingVariantIndex]?.images ?? []}
                        clearErrors={form.clearErrors}
                      />
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right column */}
            <div className="grid auto-rows-max gap-y-4">
              {/* Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                  <CardDescription>Set the status for this product.</CardDescription>
                </CardHeader>
                <CardContent>
                  <SelectField control={form.control} name="status" disabled={isPending} loadingPlaceholder="Draft" options={PRODUCT_STATUS_OPTIONS} />
                </CardContent>
              </Card>

              {/* Images Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Images</CardTitle>
                  <CardDescription>Upload product images</CardDescription>
                </CardHeader>
                <CardContent>
                  <ImageField
                    control={form.control}
                    name="images"
                    sizeLimit={100}
                    maxImages={4}
                    onAdd={handleAddImages}
                    onRemove={handleRemoveImage}
                    clearErrors={form.clearErrors}
                    disabled={isPending}
                    className="w-full"
                    defaultValues={product.images}
                  />
                </CardContent>
              </Card>

              {/* Documents Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>Attach instruction manuals, warranty cards or other product documents.</CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentField
                    control={form.control}
                    name="documents"
                    maxDocuments={5}
                    sizeLimit={5000}
                    onAdd={handleAddDocuments}
                    onRemove={handleRemoveDocument}
                    clearErrors={form.clearErrors}
                    disabled={isPending}
                    defaultValues={product.documents}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Danger Zone</CardTitle>
                  <CardDescription>Permanently delete this product and all associated data.</CardDescription>
                </CardHeader>
                <CardContent>
                  <DeleteProduct product={product} />
                </CardContent>
              </Card>
            </div>
          </div>

          <ResourceFormFooter backTo="/catalogue/products" isPending={isPending} isDirty={form.formState.isDirty} handleDiscard={handleDiscard} />
        </div>
      </div>
    </form>
  )
}

export default EditProductForm
