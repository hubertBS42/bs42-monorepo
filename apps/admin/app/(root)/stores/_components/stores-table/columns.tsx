import { ColumnDef } from "@tanstack/react-table"

import { Checkbox } from "@bs42/ui/components/checkbox"
import { format } from "date-fns"
import { Badge } from "@bs42/ui/components/badge"
import { capitalizeFirstLetter } from "@bs42/utils"
import ColumnHeader from "@/components/data-table/column-header"
import { Store, StorePlan, StoreStatus } from "@/types"

const genStatusBadge = (status: StoreStatus) => {
  const statusConfig = {
    ACTIVE: { variant: "default" as const, className: "" },
    INACTIVE: { variant: "secondary" as const, className: "" },
    SUSPENDED: { variant: "destructive" as const, className: "" },
  }

  const config = statusConfig[status] || statusConfig.ACTIVE
  return <Badge variant={config.variant}>{capitalizeFirstLetter(status)}</Badge>
}

const genPlanBadge = (plan: StorePlan) => {
  const planConfig = {
    BASIC: { variant: "default" as const, className: "" },
    ENTERPRISE: { variant: "secondary" as const, className: "" },
  }

  const config = planConfig[plan] || planConfig.BASIC
  return <Badge variant={config.variant}>{capitalizeFirstLetter(plan)}</Badge>
}

export const columns: ColumnDef<Store>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        onClick={(e) => e.stopPropagation()}
      />
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
    header: () => (
      <ColumnHeader title="Slug" sortKey="name" enableSorting={false} />
    ),
  },
  {
    accessorKey: "plan",
    header: () => <ColumnHeader title="Plan" sortKey="plan" />,
    cell: ({ row }) => genPlanBadge(row.original.plan),
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
