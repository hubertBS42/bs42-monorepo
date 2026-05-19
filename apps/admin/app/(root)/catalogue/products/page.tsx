import AddButton from "@/components/add-button"
import { getProductsForTable } from "@/lib/data/products.data"
import { ProductsFilters } from "@/types"
import { Metadata } from "next"
import ProductsTable from "./_components/categories-table"

export const metadata: Metadata = { title: "Manage Products" }

interface ProductsPageProps {
  searchParams: Promise<{
    name?: string
    pageSize?: string
    page?: string
    sort?: string
    order?: string
  }>
}

const ProductsPage = async ({ searchParams }: ProductsPageProps) => {
  const params = await searchParams

  const filters: ProductsFilters = {
    name: params.name,
    page: params.page ? parseInt(params.page) : 1,
    pageSize: params.pageSize ? parseInt(params.pageSize) : 10,
    sort: params.sort,
    order: params.order as "asc" | "desc" | undefined,
  }

  const response = await getProductsForTable(filters)
  if (!response.success) throw new Error(response.error)
  return (
    <main className="flex flex-col gap-y-6">
      <div className="flex items-end justify-between">
        <div className="grid">
          <h1 className="text-xl font-bold md:text-2xl">Manage Products</h1>
          <p className="text-sm text-muted-foreground">Manage your products.</p>
        </div>

        <AddButton label="Add Product" url="/catalogue/products/add" />
      </div>
      <ProductsTable data={response.data} />
    </main>
  )
}

export default ProductsPage
