import { ColumnDef } from "@tanstack/react-table"
import dynamic from "next/dynamic"
import { Checkbox } from "@bs42/ui/components/checkbox"
import { format } from "date-fns"
import { MemberWithUser } from "@/types"
import { RollCellSkeleton } from "./role-cell"
import ColumnHeader from "@/components/data-table/column-header"

const RoleCell = dynamic(() => import("./role-cell"), {
  ssr: false,
  loading: () => <RollCellSkeleton />,
})

export const columns: ColumnDef<MemberWithUser>[] = [
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
    id: "name",
    accessorFn: (row) => row.user.name,
    header: () => <ColumnHeader title="Name" sortKey="name" />,
  },
  {
    id: "email",
    accessorFn: (row) => row.user.email,
    header: () => <ColumnHeader title="Email" sortKey="email" />,
  },
  {
    accessorKey: "role",
    header: () => <ColumnHeader title="Role" sortKey="role" />,
    cell: ({ row }) => <RoleCell member={row.original} />,
  },

  {
    id: "createdAt",
    accessorFn: (row) => row.user.createdAt,
    header: () => <ColumnHeader title="Joined on" sortKey="createdAt" />,
    cell: ({ row }) => {
      const dateTime: Date = row.original.user.createdAt
      const formatted = format(dateTime, "MMM d, yyyy, h:mm a")
      return <span>{formatted}</span>
    },
  },
]
