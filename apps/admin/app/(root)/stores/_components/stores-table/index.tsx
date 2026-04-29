"use client"
import { DataTable } from "@/components/data-table"
import { StoresData } from "@/types"
import { columns } from "./columns"
import { useRouter } from "next/navigation"
import { filters } from "./filters"

interface StoresTableProps {
  data: StoresData
}

const OrganizationsTable = ({ data }: StoresTableProps) => {
  const router = useRouter()
  const stores = data.data
  const filteredStores = stores.filter((store) => store.slug !== "global")
  return (
    <DataTable
      columns={columns}
      filters={filters}
      data={filteredStores}
      onRowClick={(store) => router.push(`/stores/${store.id}/edit`)}
      pagination={{
        total: data.total,
        page: data.page,
        pageSize: data.pageSize,
        totalPages: data.totalPages,
      }}
    />
  )
}

export default OrganizationsTable
