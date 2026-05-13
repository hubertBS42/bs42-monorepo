import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@bs42/ui/components/checkbox"
import { format } from "date-fns"
import { Badge } from "@bs42/ui/components/badge"
import { capitalizeFirstLetter, formatCurrency } from "@bs42/utils"
import ColumnHeader from "@/components/data-table/column-header"
import { Condition, Status } from "@bs42/db/enums"
import { ProductListItem } from "@/types"
import Image from "next/image"
const genStatusBadge = (status: Status) => {
  const statusConfig = {
    PUBLISHED: { variant: "success" as const, className: "" },
    DRAFT: { variant: "warning" as const, className: "" },
    ARCHIVED: { variant: "destructive" as const, className: "" },
  }

  const config = statusConfig[status] || statusConfig.DRAFT
  return <Badge variant={config.variant}>{capitalizeFirstLetter(status)}</Badge>
}

const genConditionBadge = (condition: Condition) => {
  const conditionConfig = {
    NEW: { variant: "condition-new" as const, className: "" },
    REFURBISHED: { variant: "condition-refurbished" as const, className: "" },
    USED_LIKE_NEW: { variant: "condition-used-like-new" as const, className: "" },
    USED_GOOD: { variant: "condition-used-good" as const, className: "" },
    USED_FAIR: { variant: "condition-used-fair" as const, className: "" },
  }

  const config = conditionConfig[condition] || conditionConfig.NEW
  return <Badge variant={config.variant}>{capitalizeFirstLetter(condition.replace(/_/g, " "))}</Badge>
}

export const columns: ColumnDef<ProductListItem>[] = [
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
    cell: ({ row }) => {
      const image = row.original.images[0]
      return (
        <div className="flex items-center gap-x-3">
          <div className="relative size-10 overflow-hidden rounded bg-muted">
            {image && <Image alt={row.original.name} sizes="40px" src={image} fill className="object-cover" priority />}
          </div>
          <div className="grid gap-y-0.5">
            <span>{row.original.name}</span>
            <span className="text-[11px] text-muted-foreground">{row.original.brand.name}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "baseSellPrice",
    header: () => <ColumnHeader title="Sell Price" sortKey="baseSellPrice" />,
    cell: ({ row }) => formatCurrency(Number(row.original.baseSellPrice)),
  },
  {
    accessorKey: "categories",
    header: () => <ColumnHeader title="Category" sortKey="categories" enableSorting={false} />,
    cell: ({ row }) => {
      const categories = row.original.categories
      if (!categories?.length) return <span className="text-sm text-muted-foreground">Uncategorised</span>
      const first = categories[0]
      const remaining = categories.length - 1
      return (
        <div className="flex items-center gap-1">
          <Badge variant="outline">{first!.name}</Badge>
          {remaining > 0 && <span className="text-xs text-muted-foreground">+{remaining}</span>}
        </div>
      )
    },
  },
  {
    accessorKey: "condition",
    header: () => <ColumnHeader title="Condition" sortKey="condition" />,
    cell: ({ row }) => genConditionBadge(row.original.condition),
  },
  {
    accessorKey: "hasVariants",
    header: () => <ColumnHeader title="Type" sortKey="hasVariants" enableSorting={false} />,
    cell: ({ row }) => (row.original.hasVariants ? <Badge variant="info">Variable</Badge> : <Badge variant="muted">Simple</Badge>),
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
      const formatted = format(row.original.createdAt, "MMM d, yyyy, h:mm a")
      return <span>{formatted}</span>
    },
  },
]
