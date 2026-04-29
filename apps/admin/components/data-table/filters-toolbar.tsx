"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useTransition, useState, useCallback } from "react"
import { FieldLabel } from "@bs42/ui/components/field"
import { Input } from "@bs42/ui/components/input"
import { Button } from "@bs42/ui/components/button"
import { X } from "lucide-react"
import ClientOnlySelect from "@bs42/ui/components/client-only-select"
import DateRangeFilter from "./filters/date-range-filter"
import NumberRangeFilter from "./filters/number-range-filter"
import { FilterConfig } from "."

interface FiltersToolbarProps {
  filters: FilterConfig[]
}

const FiltersToolbar = ({ filters }: FiltersToolbarProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    filters.forEach((f) => {
      if (f.type === "dateRange") {
        initial[`${f.key}Start`] = searchParams.get(`${f.key}Start`) ?? ""
        initial[`${f.key}End`] = searchParams.get(`${f.key}End`) ?? ""
      } else if (f.type === "numberRange") {
        initial[`${f.key}Min`] = searchParams.get(`${f.key}Min`) ?? ""
        initial[`${f.key}Max`] = searchParams.get(`${f.key}Max`) ?? ""
      } else {
        initial[f.key] = searchParams.get(f.key) ?? ""
      }
    })
    return initial
  })

  const applyFilters = useCallback(
    (overrides: Record<string, string> = {}) => {
      const merged = { ...values, ...overrides }
      const params = new URLSearchParams(searchParams.toString())

      // Reset page when filters change
      params.delete("page")

      Object.entries(merged).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      })

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [values, pathname, router, searchParams]
  )

  const clearFilters = () => {
    const cleared: Record<string, string> = {}
    filters.forEach((f) => {
      if (f.type === "dateRange") {
        cleared[`${f.key}Start`] = ""
        cleared[`${f.key}End`] = ""
      } else if (f.type === "numberRange") {
        cleared[`${f.key}Min`] = ""
        cleared[`${f.key}Max`] = ""
      } else {
        cleared[f.key] = ""
      }
    })
    setValues(cleared)
    startTransition(() => router.push(pathname))
  }

  const isFiltered = Object.values(values).some((v) => v !== "")

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filters.map((filter) => (
          <div key={filter.key} className="space-y-1">
            <FieldLabel htmlFor={filter.key}>{filter.label}</FieldLabel>
            {filter.type === "text" && (
              <Input
                id={filter.key}
                className="h-8"
                placeholder={filter.placeholder ?? "Filter..."}
                value={values[filter.key] ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    [filter.key]: e.target.value,
                  }))
                }
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                disabled={isPending}
              />
            )}
            {filter.type === "select" && (
              <ClientOnlySelect
                id={filter.key}
                value={values[filter.key] || "all"}
                onValueChange={(value) => {
                  const newValues = {
                    ...values,
                    [filter.key]: value === "all" ? "" : value,
                  }
                  setValues(newValues)
                  applyFilters(newValues)
                }}
                options={filter.options ?? []}
                size="sm"
                loadingPlaceholder="All"
                placeholder={filter.placeholder ?? "Select..."}
              />
            )}
            {filter.type === "dateRange" && (
              <DateRangeFilter
                id={filter.key}
                startKey={`${filter.key}Start`}
                endKey={`${filter.key}End`}
                values={values}
                setValues={setValues}
                applyFilters={applyFilters}
                isPending={isPending}
              />
            )}
            {filter.type === "numberRange" && (
              <NumberRangeFilter
                minKey={`${filter.key}Min`}
                maxKey={`${filter.key}Max`}
                values={values}
                setValues={setValues}
                applyFilters={applyFilters}
                isPending={isPending}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => applyFilters()}
          disabled={isPending}
        >
          Search
        </Button>
        {isFiltered && (
          <Button
            size="sm"
            variant="ghost"
            onClick={clearFilters}
            disabled={isPending}
          >
            <X className="size-4" />
            Reset Filters
          </Button>
        )}
      </div>
    </div>
  )
}

export default FiltersToolbar
