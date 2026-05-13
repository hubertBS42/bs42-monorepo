"use client"

import { useRouter } from "next/navigation"
import { SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@bs42/ui/components/sonner"
import { useTransition } from "react"
import { addListingFormSchema } from "@/lib/zod"
import { createListingAction } from "@/lib/actions/listing.actions"
import { ProductDetails } from "@/types"
import { Status } from "@bs42/db/enums"
import ResourceFormHeader from "@/components/resource-form-header"
import ResourceFormFooter from "@/components/resource-form-footer"
import NumberField from "@bs42/ui/components/number-field"
import SelectField from "@bs42/ui/components/select-field"
import SwitchCardField from "@bs42/ui/components/switch-card-field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@bs42/ui/components/card"
import { FieldGroup } from "@bs42/ui/components/field"
import { PRODUCT_STATUS_OPTIONS } from "@/constants"
import { Badge } from "@bs42/ui/components/badge"
import Image from "next/image"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@bs42/ui/components/table"

interface AddListingFormProps {
  product: ProductDetails
  organizationId: string
}

const AddListingForm = ({ product, organizationId }: AddListingFormProps) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof addListingFormSchema>>({
    resolver: zodResolver(addListingFormSchema),
    defaultValues: {
      organizationId,
      productId: product.id,
      sellPrice: Number(product.baseSellPrice) || 0,
      buyPrice: Number(product.baseBuyPrice) || 0,
      compareAtPrice: 0,
      stock: 0,
      lowStockThreshold: 5,
      trackInventory: true,
      status: Status.DRAFT,
      isFeatured: false,
      variants: product.hasVariants
        ? product.variants.map((v) => ({
            variantId: v.id,
            sellPrice: 0,
            buyPrice: 0,
            compareAtPrice: 0,
            stock: 0,
            lowStockThreshold: 5,
            trackInventory: true,
            status: Status.DRAFT,
          }))
        : [],
    },
  })

  const onSubmit: SubmitHandler<z.infer<typeof addListingFormSchema>> = async (data) => {
    startTransition(async () => {
      const response = await createListingAction(data)
      if (!response.success) {
        toast.error("Operation failed", { description: response.error })
      } else {
        router.push("/store/listings")
        toast.success("Listing created successfully.")
      }
    })
  }

  const handleDiscard = () => router.push("/store/listings")

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-y-6">
        <ResourceFormHeader
          heading="Add Listing"
          description="Configure your store's listing for this product."
          backTo="/store/listings"
          isPending={isPending}
          isDirty={form.formState.isDirty}
          handleDiscard={handleDiscard}
        />

        <div className="grid gap-8">
          <div className="grid items-start gap-4 lg:grid-cols-3">
            {/* Left column */}
            <div className="grid auto-rows-max gap-y-4 lg:col-span-2">
              {/* Product Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Product</CardTitle>
                  <CardDescription>The product being listed in your store.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="relative size-16 overflow-hidden rounded-md bg-muted">
                      {product.images[0] && <Image src={product.images[0]} alt={product.name} fill sizes="64px" className="object-cover" />}
                    </div>
                    <div className="grid gap-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.brand.name}</p>
                      <div className="flex flex-wrap gap-1">
                        {product.categories.map((cat) => (
                          <Badge key={cat.id} variant="outline" className="text-xs">
                            {cat.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                  <CardDescription>Set your store&apos;s prices for this product.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <div className="grid gap-5 sm:grid-cols-3">
                      <NumberField control={form.control} label="Buy Price" name="buyPrice" step={0.01} prependText="$" disabled={isPending} />
                      <NumberField control={form.control} label="Sell Price" name="sellPrice" step={0.01} prependText="$" disabled={isPending} />
                      <NumberField control={form.control} label="Compare At Price" name="compareAtPrice" step={0.01} prependText="$" disabled={isPending} />
                    </div>
                  </FieldGroup>
                </CardContent>
              </Card>
              {/* Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                  <CardDescription>Settings for this listing.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldGroup className="gap-3">
                    <SwitchCardField
                      control={form.control}
                      label="Track Inventory"
                      name="trackInventory"
                      disabled={isPending}
                      description="Monitor and enforce stock levels for this listing"
                    />
                    <SwitchCardField control={form.control} label="Featured" name="isFeatured" disabled={isPending} description="Show this listing in featured sections" />
                  </FieldGroup>
                </CardContent>
              </Card>

              {/* Inventory — only for non-variant products */}
              {!product.hasVariants && (
                <Card>
                  <CardHeader>
                    <CardTitle>Inventory</CardTitle>
                    <CardDescription>Manage stock levels for this listing.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <NumberField control={form.control} label="Stock Quantity" name="stock" disabled={isPending} />
                      <NumberField control={form.control} label="Low Stock Alert" name="lowStockThreshold" disabled={isPending} />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Variants */}
              {product.hasVariants && (
                <Card>
                  <CardHeader>
                    <CardTitle>Variants</CardTitle>
                    <CardDescription>Set pricing and stock per variant. Leave prices empty to use the listing default.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Variant</TableHead>
                          <TableHead>Sell Price</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {product.variants.map((variant, index) => {
                          const attributes = Object.fromEntries(variant.variantValues.map((vv) => [vv.optionValue.option.name, vv.optionValue.value]))

                          return (
                            <TableRow key={variant.id}>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(attributes).map(([key, value]) => (
                                    <Badge key={key} variant="secondary" className="text-xs">
                                      {key}: {value}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>
                                <NumberField control={form.control} name={`variants.${index}.sellPrice`} step={0.01} prependText="$" disabled={isPending} className="w-32" />
                              </TableCell>
                              <TableCell>
                                <NumberField control={form.control} name={`variants.${index}.stock`} disabled={isPending} className="w-24" />
                              </TableCell>
                              <TableCell>
                                <SelectField
                                  control={form.control}
                                  name={`variants.${index}.status`}
                                  options={PRODUCT_STATUS_OPTIONS}
                                  disabled={isPending}
                                  loadingPlaceholder="Draft"
                                  className="w-32"
                                />
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right column */}
            <div className="grid auto-rows-max">
              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                  <CardDescription>Set the status for this listing.</CardDescription>
                </CardHeader>
                <CardContent>
                  <SelectField control={form.control} name="status" disabled={isPending} loadingPlaceholder="Draft" options={PRODUCT_STATUS_OPTIONS} />
                </CardContent>
              </Card>
            </div>
          </div>

          <ResourceFormFooter backTo="/store/listings" isPending={isPending} isDirty={form.formState.isDirty} handleDiscard={handleDiscard} />
        </div>
      </div>
    </form>
  )
}

export default AddListingForm
