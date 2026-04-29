"use client"

import { DataTable } from "@/components/data-table"
import { columns } from "./columns"
import { InvitationsData } from "@/types"

interface InvitationsTableProps {
  data: InvitationsData
}

const InvitationsTable = ({ data }: InvitationsTableProps) => {
  const invitations = data.data
  return (
    <DataTable
      columns={columns}
      data={invitations}
      pagination={{
        total: data.total,
        page: data.page,
        pageSize: data.pageSize,
        totalPages: data.totalPages,
      }}
    />
  )
}

export default InvitationsTable
