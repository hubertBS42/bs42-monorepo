import { Metadata } from "next"
import AddListingForm from "./_components/add-listing-form"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { getAllProducts, getProductById } from "@/lib/data/products.data"
import { getStoreListings } from "@/lib/data/listings.data"
import ProductBrowser from "./_components/product-browser"

export const metadata: Metadata = {
  title: "Add Listing",
}

type AddListingPageProps = {
  searchParams: Promise<{ productId?: string }>
}
const AddListingPage = async ({ searchParams }: AddListingPageProps) => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/sign-in")

  const activeStoreId = session.session.activeOrganizationId
  if (!activeStoreId) redirect("/")

  const { productId } = await searchParams

  // Step 1 — no product selected yet, show product browser
  if (!productId) {
    const [productsResponse, listingsResponse] = await Promise.all([
      getAllProducts(),
      getStoreListings({ pageSize: 1000 }), // get all to check listed status
    ])

    if (!productsResponse.success) throw new Error(productsResponse.error)

    const listedProductIds = new Set(listingsResponse.success ? listingsResponse.data.data.map((l) => l.productId) : [])

    const unlistedProducts = productsResponse.data.data.filter((p) => !listedProductIds.has(p.id))

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

  return <AddListingForm product={productResponse.data} organizationId={activeStoreId} />
}

export default AddListingPage
