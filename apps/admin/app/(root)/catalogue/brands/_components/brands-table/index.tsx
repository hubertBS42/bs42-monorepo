"use client"
import { DataTable } from "@/components/data-table"
import { columns } from "./columns"
import { useRouter } from "next/navigation"
import { filters } from "./filters"
import { BrandsData } from "@/types"

interface BrandsTableProps {
  data: BrandsData
}

const BrandsTable = ({ data }: BrandsTableProps) => {
  const router = useRouter()
  const brands = data.data
  return (
    <DataTable
      columns={columns}
      filters={filters}
      data={brands}
      onRowClick={(brand) => router.push(`/catalogue/brands/${brand.id}/edit`)}
      pagination={{
        total: data.total,
        page: data.page,
        pageSize: data.pageSize,
        totalPages: data.totalPages,
      }}
    />
  )
}

export default BrandsTable
