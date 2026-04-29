"use client"

import { cn } from "@bs42/ui/lib/utils"
import { Button } from "@bs42/ui/components/button"
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useTransition } from "react"

interface ColumnHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  sortKey: string
  enableSorting?: boolean
}

export default function ColumnHeader({
  title,
  sortKey,
  enableSorting = true,
  className,
}: ColumnHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  if (!enableSorting) {
    return <div className={cn(className)}>{title}</div>
  }

  const currentSort = searchParams.get("sort")
  const currentOrder = searchParams.get("order")

  const isAsc = currentSort === sortKey && currentOrder === "asc"
  const isDesc = currentSort === sortKey && currentOrder === "desc"

  const handleSort = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("page")

    if (!isAsc && !isDesc) {
      // Not sorted — sort ascending
      params.set("sort", sortKey)
      params.set("order", "asc")
    } else if (isAsc) {
      // Ascending — sort descending
      params.set("sort", sortKey)
      params.set("order", "desc")
    } else {
      // Descending — clear sort
      params.delete("sort")
      params.delete("order")
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2.5 h-8"
      onClick={handleSort}
      disabled={isPending}
    >
      <span>{title}</span>
      {isDesc ? <ArrowDown /> : isAsc ? <ArrowUp /> : <ChevronsUpDown />}
    </Button>
  )
}
