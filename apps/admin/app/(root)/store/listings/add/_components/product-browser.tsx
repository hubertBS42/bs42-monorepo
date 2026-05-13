"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Input } from "@bs42/ui/components/input"
import { Button } from "@bs42/ui/components/button"
import { Badge } from "@bs42/ui/components/badge"
import { Card, CardContent, CardFooter } from "@bs42/ui/components/card"
import { Search, Loader } from "lucide-react"
import { formatCurrency } from "@bs42/utils"
import { ProductListItem } from "@/types"

interface ProductBrowserProps {
  products: ProductListItem[]
}

const ProductBrowser = ({ products }: ProductBrowserProps) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState("")
  const [selectingId, setSelectingId] = useState<string | null>(null)

  const filtered = products.filter((product) => product.name.toLowerCase().includes(search.toLowerCase()) || product.brand.name.toLowerCase().includes(search.toLowerCase()))

  const handleSelect = (productId: string) => {
    setSelectingId(productId)
    startTransition(() => {
      router.push(`/store/listings/add?productId=${productId}`)
    })
  }

  return (
    <div className="grid gap-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search products by name or brand..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-md border">
          <p className="text-sm text-muted-foreground">No products found</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
          {filtered.map((product) => {
            const isSelecting = selectingId === product.id && isPending
            const image = product.images[0]

            return (
              <Card key={product.id} className="p-0">
                {/* Image */}
                <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
                  {image ? (
                    <Image src={image} alt={product.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover" loading="eager" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-xs text-muted-foreground">No image</span>
                    </div>
                  )}
                  {product.hasVariants && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="outline" className="bg-background/80">
                        Variants
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="grid gap-1">
                  <p className="truncate leading-tight font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.brand.name}</p>
                  <p className="text-sm font-medium">{formatCurrency(Number(product.baseSellPrice))}</p>
                  {product.categories.length > 0 && (
                    <p className="truncate text-xs text-muted-foreground">
                      {product.categories[0]?.name}
                      {product.categories.length > 1 && ` +${product.categories.length - 1}`}
                    </p>
                  )}
                </CardContent>

                <CardFooter className="p-4 pt-0">
                  <Button size="sm" className="w-full" onClick={() => handleSelect(product.id)} disabled={isPending}>
                    {isSelecting ? (
                      <>
                        <Loader className="mr-2 size-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "List This"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ProductBrowser
