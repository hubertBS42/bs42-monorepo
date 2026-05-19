import { Metadata } from "next"
import AddListingForm from "./_components/add-listing-form"
import { notFound } from "next/navigation"
import { getProductsForBrowser, getProductById } from "@/lib/data/products.data"
import { getListingsForBrowser } from "@/lib/data/listings.data"
import ProductBrowser from "./_components/product-browser"

export const metadata: Metadata = {
  title: "Add Listing",
}

type AddListingPageProps = {
  searchParams: Promise<{ productId?: string }>
}
const AddListingPage = async ({ searchParams }: AddListingPageProps) => {
  const { productId } = await searchParams

  // Step 1 — no product selected yet, show product browser
  if (!productId) {
    const [productsResponse, listingsResponse] = await Promise.all([getProductsForBrowser(), getListingsForBrowser()])

    if (!productsResponse.success) throw new Error(productsResponse.error)

    const listedProductIds = new Set(listingsResponse.success ? listingsResponse.data.map((l) => l.product.id) : [])

    const unlistedProducts = productsResponse.data.filter((p) => !listedProductIds.has(p.id))

    return (
      <main className="flex flex-col gap-y-6">
        <div className="grid">
          <h1 className="text-xl font-bold md:text-2xl">Add Listing</h1>
          <p className="text-sm text-muted-foreground">Select a product to list in your store.</p>
        </div>
        <ProductBrowser products={unlistedProducts} />
      </main>
    )
  }

  // Step 2 — product selected, show listing form
  const productResponse = await getProductById(productId)
  if (!productResponse.success) {
    if (productResponse.error === "Product not found") notFound()
    throw new Error(productResponse.error)
  }

  return <AddListingForm product={productResponse.data} />
}

export default AddListingPage
