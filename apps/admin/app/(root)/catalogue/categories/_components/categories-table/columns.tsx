import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Badge } from "@bs42/ui/components/badge"
import { capitalizeFirstLetter } from "@bs42/utils"
import ColumnHeader from "@/components/data-table/column-header"
import { Status } from "@bs42/db/enums"
import { Category } from "@bs42/db/client"

const genStatusBadge = (status: Status) => {
  const statusConfig = {
    PUBLISHED: { variant: "success" as const, className: "" },
    DRAFT: { variant: "warning" as const, className: "" },
    ARCHIVED: { variant: "destructive" as const, className: "" },
  }

  const config = statusConfig[status] || statusConfig.DRAFT
  return <Badge variant={config.variant}>{capitalizeFirstLetter(status)}</Badge>
}

export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: "name",
    header: () => (
      <div className="lg:w-100">
        <ColumnHeader title="Name" sortKey="name" enableSorting={false} />
      </div>
    ),
  },
  {
    accessorKey: "slug",
    header: () => <ColumnHeader title="Slug" sortKey="slug" enableSorting={false} />,
  },
  {
    accessorKey: "status",
    header: () => <ColumnHeader title="Status" sortKey="status" enableSorting={false} />,
    cell: ({ row }) => genStatusBadge(row.original.status),
  },
  {
    accessorKey: "createdAt",
    header: () => <ColumnHeader title="Created On" sortKey="createdAt" enableSorting={false} />,
    cell: ({ row }) => {
      const dateTime: Date = row.original.createdAt
      const formatted = format(dateTime, "MMM d, yyyy, h:mm a")
      return <span>{formatted}</span>
    },
  },
]
