"use client"
import { DataTable } from "@/components/data-table"
import { UsersData } from "@/types"
import { columns } from "./columns"
import { useRouter } from "next/navigation"
import { filters } from "./filters"

interface UsersTableProps {
  data: UsersData
}

const UsersTable = ({ data }: UsersTableProps) => {
  const router = useRouter()
  const users = data.data
  return (
    <DataTable
      columns={columns}
      data={users}
      onRowClick={(user) => router.push(`/users/${user.id}/edit`)}
      filters={filters}
      pagination={{
        total: data.total,
        page: data.page,
        pageSize: data.pageSize,
        totalPages: data.totalPages,
      }}
    />
  )
}

export default UsersTable
