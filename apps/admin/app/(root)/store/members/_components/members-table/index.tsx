"use client"
import { DataTable } from "@/components/data-table"
import { MembersData } from "@/types"
import { columns } from "./columns"
import { useRouter } from "next/navigation"

interface MembersTableProps {
  data: MembersData
}

const MembersTable = ({ data }: MembersTableProps) => {
  const router = useRouter()
  const members = data.data
  return (
    <DataTable
      columns={columns}
      data={members}
      pagination={{
        total: data.total,
        page: data.page,
        pageSize: data.pageSize,
        totalPages: data.totalPages,
      }}
      onRowClick={(member) =>
        router.push(`/store/members/${member.id}/details`)
      }
    />
  )
}

export default MembersTable
