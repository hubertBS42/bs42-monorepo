import { Metadata } from "next"
import { getOrdersForTable } from "@/lib/data/orders.data"
import OrdersTable from "./_components/orders-table"
import { OrderStatus } from "@bs42/db/enums"
import { OrdersFilters } from "@/types"
import AddButton from "@/components/add-button"

export const metadata: Metadata = { title: "Store Orders" }

type StoreOrdersPageProps = {
  searchParams: Promise<{
    reference?: string
    status?: string
    page?: string
    pageSize?: string
    sort?: string
    order?: string
  }>
}

const StoreOrdersPage = async ({ searchParams }: StoreOrdersPageProps) => {
  const params = await searchParams

  const filters: OrdersFilters = {
    reference: params.reference,
    status: params.status as OrderStatus | undefined,
    page: params.page ? parseInt(params.page) : 1,
    pageSize: params.pageSize ? parseInt(params.pageSize) : 10,
    sort: params.sort,
    order: params.order as "asc" | "desc" | undefined,
  }

  const response = await getOrdersForTable(filters)
  if (!response.success) throw new Error(response.error)

  return (
    <main className="flex flex-col gap-y-6">
      <div className="flex items-end justify-between">
        <div className="grid">
          <h1 className="text-xl font-bold md:text-2xl">Manage Orders</h1>
          <p className="text-sm text-muted-foreground">View and Manage this store&apos;s orders.</p>
        </div>
        <AddButton label="Create Order" url="/store/orders/create" />
      </div>
      <OrdersTable data={response.data} />
    </main>
  )
}

export default StoreOrdersPage
