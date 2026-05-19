import AddButton from "@/components/add-button"
import { getListingsForTable } from "@/lib/data/listings.data"
import { ListingsFilters } from "@/types"
import { Metadata } from "next"
import ListingsTable from "./_components/listings-table"

export const metadata: Metadata = { title: "Store Listings" }

type StoreListingsPageProps = {
  searchParams: Promise<{
    name?: string
    pageSize?: string
    page?: string
    sort?: string
    order?: string
  }>
}

const StoreListingsPage = async ({ searchParams }: StoreListingsPageProps) => {
  const params = await searchParams

  const filters: ListingsFilters = {
    name: params.name,
    page: params.page ? parseInt(params.page) : 1,
    pageSize: params.pageSize ? parseInt(params.pageSize) : 10,
    sort: params.sort,
    order: params.order as "asc" | "desc" | undefined,
  }

  const response = await getListingsForTable(filters)
  if (!response.success) throw new Error(response.error)
  return (
    <main className="flex flex-col gap-y-6">
      <div className="flex items-end justify-between">
        <div className="grid">
          <h1 className="text-xl font-bold md:text-2xl">Manage Listings</h1>
          <p className="text-sm text-muted-foreground">View and manage this store&apos;s listings.</p>
        </div>

        <AddButton label="Add Listing" url="/store/listings/add" />
      </div>
      <ListingsTable data={response.data} />
    </main>
  )
}
export default StoreListingsPage
