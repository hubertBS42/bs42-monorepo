"use client"

import { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { z } from "zod"
import { createOrderFormSchema } from "@/lib/zod"
import { ListingForOrder } from "@/types"
import { Button } from "@bs42/ui/components/button"
import { Input } from "@bs42/ui/components/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@bs42/ui/components/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@bs42/ui/components/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@bs42/ui/components/select"
import { Search, Plus, Trash2, ChevronRight } from "lucide-react"
import { formatCurrency } from "@bs42/utils"
import Image from "next/image"
import NumberInput from "@bs42/ui/components/number-input"

type FormValues = z.infer<typeof createOrderFormSchema>

interface ItemsStepProps {
  form: UseFormReturn<FormValues>
  listings: ListingForOrder[]
  exchangeRate: number
  onNext: () => void
}

const ItemsStep = ({ form, listings, exchangeRate, onNext }: ItemsStepProps) => {
  const [search, setSearch] = useState("")
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({}) // listingId -> variantId

  const items = form.watch("items")

  const filtered = listings.filter((l) => l.product.name.toLowerCase().includes(search.toLowerCase()) || l.product.brand.name.toLowerCase().includes(search.toLowerCase()))

  const getEffectivePrice = (listing: ListingForOrder, variantId?: string): number => {
    if (variantId) {
      const slv = listing.storeListingVariants.find((v) => v.variantId === variantId)
      return Number(slv?.sellPrice ?? listing.sellPrice)
    }
    return Number(listing.sellPrice)
  }

  const getVariantDescription = (listing: ListingForOrder, variantId: string): string => {
    const slv = listing.storeListingVariants.find((v) => v.variantId === variantId)
    if (!slv) return ""
    const attrs = Object.fromEntries(slv.variant.variantValues?.map((vv) => [vv.optionValue.option.name, vv.optionValue.value]) ?? [])
    return Object.entries(attrs)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ")
  }

  const handleAddItem = (listing: ListingForOrder) => {
    const selectedVariantId = selectedVariants[listing.id]

    // For variant products, require a variant selection
    if (listing.product.hasVariants && !selectedVariantId) return

    const existingIndex = items.findIndex((i) => i.storeListingId === listing.id && i.storeListingVariantId === (selectedVariantId ?? null))

    if (existingIndex !== -1) {
      // Increment quantity if already in order
      const currentQty = form.getValues(`items.${existingIndex}.quantity`)
      form.setValue(`items.${existingIndex}.quantity`, currentQty + 1, { shouldDirty: true })
      return
    }

    const unitPrice = getEffectivePrice(listing, selectedVariantId)
    const variantDescription = selectedVariantId ? getVariantDescription(listing, selectedVariantId) : null

    const slv = selectedVariantId ? listing.storeListingVariants.find((v) => v.variantId === selectedVariantId) : null

    form.setValue("items", [
      ...items,
      {
        storeListingId: listing.id,
        storeListingVariantId: slv?.id ?? null,
        quantity: 1,
        unitPrice,
        productName: listing.product.name,
        productSlug: listing.product.name.toLowerCase().replace(/ /g, "-"),
        productImage: listing.product.images[0] ?? null,
        variantDescription,
        sku: slv?.variant.sku ?? listing.product.sku ?? null,
        storeName: listing.organization?.name ?? "",
      },
    ])
  }

  const handleRemoveItem = (index: number) => {
    form.setValue(
      "items",
      items.filter((_, i) => i !== index)
    )
  }

  const handleQuantityChange = (index: number, quantity: number) => {
    form.setValue(`items.${index}.quantity`, quantity, { shouldDirty: true })
  }

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

  const canProceed = items.length > 0

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Product Search */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Add Products</CardTitle>
            <CardDescription>Search and add products from your store listings.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>

            <div className="grid max-h-96 gap-2 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No listings found</p>
              ) : (
                filtered.map((listing) => {
                  const image = listing.product.images[0]
                  const hasVariants = listing.product.hasVariants
                  const selectedVariantId = selectedVariants[listing.id]

                  return (
                    <div key={listing.id} className="flex items-center gap-3 rounded-md border p-3">
                      <div className="relative size-13 shrink-0 overflow-hidden rounded bg-muted">
                        {image && <Image src={image} alt={listing.product.name} fill sizes="40px" className="object-cover" />}
                      </div>
                      <div className="grid min-w-0 flex-1 gap-1">
                        <p className="truncate text-sm font-medium">{listing.product.name}</p>
                        <p className="text-xs text-muted-foreground">{listing.product.brand.name}</p>
                        <p className="text-xs font-medium text-primary">
                          {formatCurrency(getEffectivePrice(listing, selectedVariantId) * exchangeRate, "GHS", "en-GH", { currencyDisplay: "symbol" })}
                          <span className="font-normal text-muted-foreground"> · {formatCurrency(getEffectivePrice(listing, selectedVariantId))}</span>
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {hasVariants && (
                          <Select value={selectedVariantId ?? ""} onValueChange={(val) => setSelectedVariants((prev) => ({ ...prev, [listing.id]: val }))}>
                            <SelectTrigger className="w-37.5">
                              <SelectValue placeholder="Select variant..." />
                            </SelectTrigger>
                            <SelectContent>
                              {listing.storeListingVariants.map((slv) => {
                                const attrs = Object.fromEntries(slv.variant.variantValues?.map((vv) => [vv.optionValue.option.name, vv.optionValue.value]) ?? [])
                                const label = Object.entries(attrs)
                                  .map(([k, v]) => `${k}: ${v}`)
                                  .join(", ")
                                // const price = Number(slv.sellPrice ?? listing.sellPrice)
                                return (
                                  <SelectItem key={slv.variantId} value={slv.variantId}>
                                    {label}
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                        )}
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="shrink-0"
                          onClick={() => handleAddItem(listing)}
                          disabled={hasVariants && !selectedVariantId}
                        >
                          <Plus className="size-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
            <CardDescription>
              {items.length} item{items.length !== 1 ? "s" : ""} added
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {items.length === 0 ? (
              <div className="flex h-48 items-center justify-center rounded-md border border-dashed">
                <p className="text-sm text-muted-foreground">No items added yet</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="grid gap-0.5">
                            <p className="text-sm font-medium">{item.productName}</p>
                            {item.variantDescription && <p className="text-xs text-muted-foreground">{item.variantDescription}</p>}
                          </div>
                        </TableCell>
                        <TableCell>
                          {/* <Input type="number" min={1} value={item.quantity} onChange={(e) => handleQuantityChange(index, Math.max(1, Number(e.target.value)))} className="w-16" /> */}
                          <div className="w-20">
                            <NumberInput min={1} value={item.quantity} onChange={(value) => handleQuantityChange(index, Math.max(1, value))} />
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {formatCurrency(item.unitPrice * item.quantity * exchangeRate, "GHS", "en-GH", {
                              currencyDisplay: "symbol",
                            })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex items-center justify-between border-t pt-4">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-semibold">{formatCurrency(subtotal * exchangeRate, "GHS", "en-GH", { currencyDisplay: "symbol" })}</span>
                </div>
              </>
            )}

            {form.formState.errors.items && <p className="text-sm text-destructive">{form.formState.errors.items.message}</p>}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={onNext} disabled={!canProceed}>
          Continue to Customer
          <ChevronRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  )
}

export default ItemsStep
