"use client"
import { DataTable } from "@/components/data-table"
import { columns } from "./columns"
import { useRouter } from "next/navigation"
import { filters } from "./filters"
import { ProductsData } from "@/types"

interface ProductsTableProps {
  data: ProductsData
}

const ProductsTable = ({ data }: ProductsTableProps) => {
  const router = useRouter()
  const products = data.data
  return (
    <DataTable
      columns={columns}
      filters={filters}
      data={products}
      onRowClick={(product) => router.push(`/catalogue/products/${product.id}/edit`)}
      pagination={{
        total: data.total,
        page: data.page,
        pageSize: data.pageSize,
        totalPages: data.totalPages,
      }}
    />
  )
}

export default ProductsTable
