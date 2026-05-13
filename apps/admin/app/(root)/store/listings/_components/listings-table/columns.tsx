import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@bs42/ui/components/checkbox"
import { format } from "date-fns"
import { Badge } from "@bs42/ui/components/badge"
import { capitalizeFirstLetter, formatCurrency } from "@bs42/utils"
import ColumnHeader from "@/components/data-table/column-header"
import { Status } from "@bs42/db/enums"
import { ListingsListItem } from "@/types"
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

export const columns: ColumnDef<ListingsListItem>[] = [
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
    accessorKey: "product.name",
    header: () => <ColumnHeader title="Product" sortKey="name" />,
    cell: ({ row }) => {
      const image = row.original.product.images[0]
      return (
        <div className="flex items-center gap-x-3">
          <div className="relative size-10 overflow-hidden rounded bg-muted">
            {image && <Image alt={row.original.product.name} sizes="40px" src={image} fill className="object-cover" priority />}
          </div>
          <div className="grid gap-y-0.5">
            <span>{row.original.product.name}</span>
            <span className="text-[11px] text-muted-foreground">{row.original.product.brand.name}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "sellPrice",
    header: () => <ColumnHeader title="Sell Price" sortKey="sellPrice" />,
    cell: ({ row }) => formatCurrency(Number(row.original.sellPrice)),
  },
  {
    accessorKey: "stock",
    header: () => <ColumnHeader title="Stock" sortKey="stock" />,
    cell: ({ row }) => {
      const { product, stock } = row.original
      if (product.hasVariants) return <Badge variant="info">Variants</Badge>
      return <span>{stock}</span>
    },
  },
  {
    accessorKey: "product.categories",
    header: () => <ColumnHeader title="Category" sortKey="categories" enableSorting={false} />,
    cell: ({ row }) => {
      const categories = row.original.product.categories
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
    accessorKey: "isFeatured",
    header: () => <ColumnHeader title="Featured" sortKey="isFeatured" enableSorting={false} />,
    cell: ({ row }) => (row.original.isFeatured ? <Badge variant="featured">Featured</Badge> : null),
  },
  {
    accessorKey: "status",
    header: () => <ColumnHeader title="Status" sortKey="status" />,
    cell: ({ row }) => genStatusBadge(row.original.status),
  },
  {
    accessorKey: "createdAt",
    header: () => <ColumnHeader title="Listed On" sortKey="createdAt" />,
    cell: ({ row }) => {
      const formatted = format(row.original.createdAt, "MMM d, yyyy, h:mm a")
      return <span>{formatted}</span>
    },
  },
]
