"use client"

import { useCallback, useEffect, useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { z } from "zod"
import { createOrderFormSchema } from "@/lib/zod"
import { ListingForOrder } from "@/types"
import { Button } from "@bs42/ui/components/button"
import { Input } from "@bs42/ui/components/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@bs42/ui/components/card"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@bs42/ui/components/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@bs42/ui/components/select"
import { Search, Plus, Trash2, ChevronRight } from "lucide-react"
import { formatCurrency } from "@bs42/utils"
import Image from "next/image"
import NumberInput from "@bs42/ui/components/number-input"
import { Item, ItemActions, ItemContent, ItemGroup, ItemMedia } from "@bs42/ui/components/item"
import Link from "next/link"

type FormValues = z.infer<typeof createOrderFormSchema>

interface ItemsStepProps {
  form: UseFormReturn<FormValues>
  exchangeRate: number
  organizationId: string
  onNext: () => void
}

const ItemsStep = ({ form, exchangeRate, organizationId, onNext }: ItemsStepProps) => {
  const [search, setSearch] = useState("")
  const [listings, setListings] = useState<ListingForOrder[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({}) // listingId -> variantId

  const fetchListings = useCallback(
    async (q: string, p: number, append = false) => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/store/listings/search?q=${encodeURIComponent(q)}&page=${p}&organizationId=${organizationId}`)
        const data = await res.json()
        setListings((prev) => (append ? [...prev, ...data.listings] : data.listings))
        setHasMore(data.hasMore)
        setPage(p)
      } catch (error) {
        console.error("Failed to fetch listings", error)
      } finally {
        setIsLoading(false)
      }
    },
    [organizationId]
  )

  // Initial fetch on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchListings("", 1)
  }, [fetchListings])

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchListings(search, 1)
    }, 300)
    return () => clearTimeout(timeout)
  }, [search, fetchListings])

  const handleLoadMore = () => {
    fetchListings(search, page + 1, true)
  }

  const items = form.watch("items")

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

    if (listing.product.hasVariants && !selectedVariantId) return

    const slv = selectedVariantId ? listing.storeListingVariants.find((v) => v.variantId === selectedVariantId) : null

    const storeListingVariantId = slv?.id ?? null

    const existingIndex = items.findIndex((i) => i.storeListingId === listing.id && i.storeListingVariantId === storeListingVariantId)

    if (existingIndex !== -1) {
      const currentQty = form.getValues(`items.${existingIndex}.quantity`)
      form.setValue(`items.${existingIndex}.quantity`, currentQty + 1, { shouldDirty: true })
      return
    }

    const unitPrice = getEffectivePrice(listing, selectedVariantId)
    const variantDescription = selectedVariantId ? getVariantDescription(listing, selectedVariantId) : null

    form.setValue("items", [
      ...items,
      {
        storeListingId: listing.id,
        storeListingVariantId,
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
      <div className="grid items-start gap-4 lg:grid-cols-2">
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
              {isLoading && listings.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p>
              ) : listings.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No listings found</p>
              ) : (
                <ItemGroup>
                  {listings.map((listing) => {
                    const image = listing.product.images[0]
                    const hasVariants = listing.product.hasVariants
                    const selectedVariantId = selectedVariants[listing.id]

                    return (
                      <Item key={listing.id} variant={"outline"} role="listitem" className="p-2">
                        {image && (
                          <ItemMedia variant="image" className="size-14">
                            <Image src={image} alt={listing.product.name} width={40} height={40} className="object-cover" />
                          </ItemMedia>
                        )}
                        <ItemContent>
                          <Link href={`/store/listings/${listing.id}/edit`} target="_blank" className="truncate text-sm font-medium">
                            {listing.product.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">{listing.product.brand.name}</p>
                          <p className="text-xs font-medium text-primary">
                            {formatCurrency(getEffectivePrice(listing, selectedVariantId) * exchangeRate, "GHS", "en-GH", { currencyDisplay: "symbol" })}
                            <span className="font-normal text-muted-foreground"> · {formatCurrency(getEffectivePrice(listing, selectedVariantId))}</span>
                          </p>
                        </ItemContent>
                        <ItemActions>
                          <>
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
                          </>
                        </ItemActions>
                      </Item>
                    )
                  })}
                </ItemGroup>
              )}

              {hasMore && (
                <Button type="button" variant="ghost" size="sm" className="w-full" onClick={handleLoadMore} disabled={isLoading}>
                  Load more
                </Button>
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
                  <TableHeader className="bg-muted">
                    <TableRow>
                      <TableHead className="w-[5%]"></TableHead>
                      <TableHead className="w-[50%]">Product</TableHead>
                      <TableHead className="w-[20%]">Qty</TableHead>
                      <TableHead className="w-[25%] text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="grid gap-0.5">
                            <Link href={`/store/listings/${item.storeListingId}/edit`} target="_blank" className="text-sm font-medium">
                              {item.productName}
                            </Link>
                            {item.variantDescription && <p className="text-xs text-muted-foreground">{item.variantDescription}</p>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <NumberInput min={1} value={item.quantity} onChange={(value) => handleQuantityChange(index, Math.max(1, value))} />
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm">
                            {formatCurrency(item.unitPrice * item.quantity * exchangeRate, "GHS", "en-GH", {
                              currencyDisplay: "symbol",
                            })}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell className="font-medium" colSpan={3}>
                        Subtotal
                      </TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(subtotal * exchangeRate, "GHS", "en-GH", { currencyDisplay: "symbol" })}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>

                {/* <div className="flex items-center justify-between border-t pt-4">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-semibold">{formatCurrency(subtotal * exchangeRate, "GHS", "en-GH", { currencyDisplay: "symbol" })}</span>
                </div> */}
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
