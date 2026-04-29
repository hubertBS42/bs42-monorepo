"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@bs42/ui/components/badge"
import { formatDistanceToNow } from "date-fns"
import ColumnHeader from "@/components/data-table/column-header"
import { capitalizeFirstLetter } from "@bs42/utils"
import InvitationActions from "./actions"
import { InvitationWithInviter } from "@/types"
import { Checkbox } from "@bs42/ui/components/checkbox"

export const columns: ColumnDef<InvitationWithInviter>[] = [
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
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: () => <ColumnHeader title="Email" sortKey="email" />,
  },
  {
    accessorKey: "role",
    header: () => <ColumnHeader title="Role" sortKey="role" />,
    cell: ({ row }) => (
      <Badge variant="outline">
        {capitalizeFirstLetter(row.original.role as string)}
      </Badge>
    ),
  },
  {
    id: "inviter",
    header: () => <ColumnHeader title="Invited by" sortKey="inviterId" />,
    cell: ({ row }) => row.original.inviter.name,
  },
  {
    accessorKey: "expiresAt",
    header: () => <ColumnHeader title="Expires" sortKey="expiresAt" />,
    cell: ({ row }) => {
      const expiresAt = new Date(row.original.expiresAt)
      const isExpired = expiresAt < new Date()
      return (
        <span
          className={`${isExpired ? "text-destructive" : "text-muted-foreground"}`}
        >
          {isExpired
            ? `Expired ${formatDistanceToNow(expiresAt, { addSuffix: true })}`
            : formatDistanceToNow(expiresAt, { addSuffix: true })}
        </span>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <InvitationActions invitation={row.original} />,
  },
]
