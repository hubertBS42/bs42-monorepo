"use client"
import { DataTable } from "@/components/data-table"
import { columns } from "./columns"
import { useRouter } from "next/navigation"
import { filters } from "./filters"
import { ListingsData } from "@/types"

interface ListingsTableProps {
  data: ListingsData
}

const ListingsTable = ({ data }: ListingsTableProps) => {
  const router = useRouter()
  const listings = data.data
  return (
    <DataTable
      columns={columns}
      filters={filters}
      data={listings}
      onRowClick={(listing) => router.push(`/store/listings/${listing.id}/edit`)}
      pagination={{
        total: data.total,
        page: data.page,
        pageSize: data.pageSize,
        totalPages: data.totalPages,
      }}
    />
  )
}

export default ListingsTable
