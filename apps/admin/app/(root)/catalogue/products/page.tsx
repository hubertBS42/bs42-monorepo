import AddButton from "@/components/add-button"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Manage Products" }

const ProductsPage = async () => {
  return (
    <main className="flex flex-col gap-y-6">
      <div className="flex items-end justify-between">
        <div className="grid">
          <h1 className="text-xl font-bold md:text-2xl">Manage Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage your store&apos;s products.
          </p>
        </div>

        <AddButton label="Add Product" url="/catalogue/products/add" />
      </div>
    </main>
  )
}

export default ProductsPage
