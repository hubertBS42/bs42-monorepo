import { Metadata } from "next"
import StoresTable from "./_components/stores-table"
import { fetchStores } from "@/lib/data/stores.data"
import AddButton from "@/components/add-button"
import SuccessToast from "@bs42/ui/components/success-toast"
import { StoresFilters } from "@/types"

export const metadata: Metadata = {
  title: "Manage Stores",
}

type StoresPageProps = {
  searchParams: Promise<{
    success?: string
    name?: string
    pageSize?: string
    page?: string
    sort?: string
    order?: string
  }>
}
const StoresPage = async ({ searchParams }: StoresPageProps) => {
  const params = await searchParams

  const filters: StoresFilters = {
    name: params.name,
    page: params.page ? parseInt(params.page) : 1,
    pageSize: params.pageSize ? parseInt(params.pageSize) : 10,
    sort: params.sort,
    order: params.order as "asc" | "desc" | undefined,
  }

  const result = await fetchStores(filters)
  if (!result.success) throw new Error(result.error)
  return (
    <main className="flex flex-col gap-y-6">
      {params.success && (
        <SuccessToast message={decodeURIComponent(params.success)} />
      )}
      <div className="flex items-end justify-between">
        <div className="grid">
          <h1 className="text-xl font-bold md:text-2xl">Manage Stores</h1>
          <p className="text-sm text-muted-foreground">
            View and manage all stores.
          </p>
        </div>

        <AddButton label="Add Store" url="/stores/add" />
      </div>
      <StoresTable data={result.data} />
    </main>
  )
}

export default StoresPage
