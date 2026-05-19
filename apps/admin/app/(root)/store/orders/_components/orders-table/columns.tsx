import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Badge } from "@bs42/ui/components/badge"
import { capitalizeFirstLetter, formatCurrency } from "@bs42/utils"
import ColumnHeader from "@/components/data-table/column-header"
import { OrderListItem } from "@/types"
import { OrderStatus } from "@bs42/db/enums"
import { Checkbox } from "@bs42/ui/components/checkbox"

const STATUS_VARIANTS: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  CONFIRMED: "default",
  PROCESSING: "default",
  SHIPPED: "default",
  DELIVERED: "default",
  COMPLETED: "default",
  CANCELLED: "destructive",
  REFUNDED: "destructive",
}

export const columns: ColumnDef<OrderListItem>[] = [
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
    accessorKey: "reference",
    header: () => <ColumnHeader title="Reference" sortKey="reference" />,
    cell: ({ row }) => <span className="font-mono text-sm">{row.original.reference}</span>,
  },
  {
    accessorKey: "customerName",
    header: () => <ColumnHeader title="Customer" sortKey="customerName" />,
    cell: ({ row }) => (
      <div className="grid gap-0.5">
        <span>{row.original.customerName}</span>
        <span className="text-xs text-muted-foreground">{row.original.customerEmail}</span>
      </div>
    ),
  },
  {
    accessorKey: "orderItems",
    header: () => <ColumnHeader title="Items" sortKey="orderItems" enableSorting={false} />,
    cell: ({ row }) => (
      <span>
        {row.original.orderItems.length} item{row.original.orderItems.length !== 1 ? "s" : ""}
      </span>
    ),
  },
  {
    accessorKey: "totalPrice",
    header: () => <ColumnHeader title="Total" sortKey="totalPrice" />,
    cell: ({ row }) => formatCurrency(Number(row.original.totalPrice) * Number(row.original.exchangeRate)),
  },
  {
    accessorKey: "paymentStatus",
    header: () => <ColumnHeader title="Payment" sortKey="paymentStatus" />,
    cell: ({ row }) => <Badge variant={row.original.paymentStatus === "PAID" ? "default" : "secondary"}>{capitalizeFirstLetter(row.original.paymentStatus)}</Badge>,
  },
  {
    accessorKey: "status",
    header: () => <ColumnHeader title="Status" sortKey="status" />,
    cell: ({ row }) => <Badge variant={STATUS_VARIANTS[row.original.status as OrderStatus]}>{capitalizeFirstLetter(row.original.status)}</Badge>,
  },
  {
    accessorKey: "createdAt",
    header: () => <ColumnHeader title="Placed On" sortKey="createdAt" />,
    cell: ({ row }) => format(row.original.createdAt, "MMM d, yyyy, h:mm a"),
  },
]
