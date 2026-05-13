"use client"

import { ColumnDef, flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@bs42/ui/components/table"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@bs42/ui/lib/utils"

interface DataTableTreeProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  expandableColumnId?: string
  onRowClick?: (row: TData) => void
}

type TreeNode<T> = {
  id: string | number
  children?: T[]
}

const DataTableTree = <TData extends TreeNode<TData>, TValue>({ columns, data, expandableColumnId = "name", onRowClick }: DataTableTreeProps<TData, TValue>) => {
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id?.toString(),
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: (row) => row.children ?? [],
    initialState: {
      expanded: true,
    },
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header, idx) => {
                return (
                  <TableHead key={header.id} className={cn(idx === 0 && "w-7")}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className={cn(onRowClick && "cursor-pointer")} onClick={() => onRowClick?.(row.original)}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {cell.column.id === expandableColumnId && (
                      <span style={{ paddingLeft: `${row.depth * 1.5}rem` }}>
                        {row.getCanExpand() ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              row.getToggleExpandedHandler()()
                            }}
                            className="z-100 mr-2 cursor-pointer"
                            aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
                            type="button"
                          >
                            {row.getIsExpanded() ? <ChevronDown className="h-4 w-4 shrink-0 opacity-50" /> : <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />}
                          </button>
                        ) : (
                          row.depth > 0 && <span className="mr-4 size-4" /> // spacing for non-expandable
                        )}
                      </span>
                    )}
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default DataTableTree
