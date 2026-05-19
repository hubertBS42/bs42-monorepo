"use client"
import { DataTable } from "@/components/data-table"
import { columns } from "./columns"
import { useRouter } from "next/navigation"
import { filters } from "./filters"
import { OrdersData } from "@/types"

interface OrdersTableProps {
  data: OrdersData
}

const OrdersTable = ({ data }: OrdersTableProps) => {
  const router = useRouter()
  const orders = data.data
  return (
    <DataTable
      columns={columns}
      filters={filters}
      data={orders}
      onRowClick={(order) => router.push(`/store/orders/${order.id}/details`)}
      pagination={{
        total: data.total,
        page: data.page,
        pageSize: data.pageSize,
        totalPages: data.totalPages,
      }}
    />
  )
}

export default OrdersTable
