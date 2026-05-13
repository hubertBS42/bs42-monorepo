import { ColumnDef } from "@tanstack/react-table"

import { Checkbox } from "@bs42/ui/components/checkbox"
import { format } from "date-fns"
import { Badge } from "@bs42/ui/components/badge"
import { capitalizeFirstLetter } from "@bs42/utils"
import ColumnHeader from "@/components/data-table/column-header"
import { Status } from "@bs42/db/enums"
import { Brand } from "@bs42/db/client"

const genStatusBadge = (status: Status) => {
  const statusConfig = {
    PUBLISHED: { variant: "success" as const, className: "" },
    DRAFT: { variant: "warning" as const, className: "" },
    ARCHIVED: { variant: "destructive" as const, className: "" },
  }

  const config = statusConfig[status] || statusConfig.DRAFT
  return <Badge variant={config.variant}>{capitalizeFirstLetter(status)}</Badge>
}

export const columns: ColumnDef<Brand>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" onClick={(e) => e.stopPropagation()} />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: () => <ColumnHeader title="Name" sortKey="name" />,
  },
  {
    accessorKey: "slug",
    header: () => <ColumnHeader title="Slug" sortKey="slug" enableSorting={false} />,
  },
  {
    accessorKey: "isFeatured",
    header: () => <ColumnHeader title="Featured" sortKey="isFeatured" />,
    cell: ({ row }) => (row.original.isFeatured ? <Badge variant="featured">Featured</Badge> : null),
  },
  {
    accessorKey: "status",
    header: () => <ColumnHeader title="Status" sortKey="status" />,
    cell: ({ row }) => genStatusBadge(row.original.status),
  },
  {
    accessorKey: "createdAt",
    header: () => <ColumnHeader title="Created On" sortKey="createdAt" />,
    cell: ({ row }) => {
      const dateTime: Date = row.original.createdAt
      const formatted = format(dateTime, "MMM d, yyyy, h:mm a")
      return <span>{formatted}</span>
    },
  },
]
