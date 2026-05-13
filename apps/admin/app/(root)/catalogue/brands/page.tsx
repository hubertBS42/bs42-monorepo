import AddButton from "@/components/add-button"
import { getAllBrands } from "@/lib/data/brands.data"
import { BrandsFilters } from "@/types"
import { Metadata } from "next"
import BrandsTable from "./_components/brands-table"

export const metadata: Metadata = { title: "Manage Brands" }

interface BrandsPageProps {
  searchParams: Promise<{
    name?: string
    pageSize?: string
    page?: string
    sort?: string
    order?: string
  }>
}

const BrandsPage = async ({ searchParams }: BrandsPageProps) => {
  const params = await searchParams

  const filters: BrandsFilters = {
    name: params.name,
    page: params.page ? parseInt(params.page) : 1,
    pageSize: params.pageSize ? parseInt(params.pageSize) : 10,
    sort: params.sort,
    order: params.order as "asc" | "desc" | undefined,
  }

  const response = await getAllBrands(filters)
  if (!response.success) throw new Error(response.error)
  return (
    <main className="flex flex-col gap-y-6">
      <div className="flex items-end justify-between">
        <div className="grid">
          <h1 className="text-xl font-bold md:text-2xl">Manage Brands</h1>
          <p className="text-sm text-muted-foreground">Manage your product brands.</p>
        </div>

        <AddButton label="Add Brand" url="/catalogue/brands/add" />
      </div>
      <BrandsTable data={response.data} />
    </main>
  )
}

export default BrandsPage
