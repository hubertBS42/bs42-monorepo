import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@bs42/ui/components/checkbox"
import { format } from "date-fns"
import { Badge } from "@bs42/ui/components/badge"
import { capitalizeFirstLetter } from "@bs42/utils"
import { User } from "@bs42/db/client"
import { SystemRole } from "@bs42/auth"
import ColumnHeader from "@/components/data-table/column-header"

const genRoleBadge = (role: SystemRole) => {
  const roleConfig = {
    superAdmin: { variant: "default" as const, className: "" },
    admin: { variant: "secondary" as const, className: "" },
    user: { variant: "outline" as const, className: "" },
  }

  const config = roleConfig[role] || roleConfig.user
  return <Badge variant={config.variant}>{capitalizeFirstLetter(role)}</Badge>
}

export const columns: ColumnDef<User>[] = [
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
    accessorKey: "email",
    header: () => <ColumnHeader title="Email" sortKey="email" />,
  },
  {
    accessorKey: "role",
    header: () => <ColumnHeader title="Role" sortKey="role" />,
    cell: ({ row }) => genRoleBadge(row.original.role as SystemRole),
  },
  {
    accessorKey: "banned",
    header: () => <ColumnHeader title="Status" sortKey="banned" />,
    cell: ({ row }) => {
      const isBanned = row.getValue("banned") as boolean
      return (
        <Badge variant={isBanned ? "destructive" : "default"}>
          {isBanned ? "Banned" : "Active"}
        </Badge>
      )
    },
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
