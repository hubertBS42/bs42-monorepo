"use client"

import { Button } from "@bs42/ui/components/button"
import { Calendar } from "@bs42/ui/components/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@bs42/ui/components/popover"
import { cn } from "@bs42/ui/lib/utils"
import { format } from "date-fns"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { DateRange } from "react-day-picker"

interface DateRangeFilterProps {
  id: string
  startKey: string
  endKey: string
  values: Record<string, string>
  setValues: (v: Record<string, string>) => void
  applyFilters: (overrides?: Record<string, string>) => void
  isPending?: boolean
}

const DateRangeFilter = ({
  id,
  startKey,
  endKey,
  values,
  setValues,
  applyFilters,
  isPending,
}: DateRangeFilterProps) => {
  const date: DateRange | undefined =
    values[startKey] && values[endKey]
      ? { from: new Date(values[startKey]), to: new Date(values[endKey]) }
      : undefined

  const handleSelect = (range: DateRange | undefined) => {
    if (range?.from) {
      const from = new Date(range.from)
      from.setHours(0, 0, 0, 0)

      const to = new Date(range.to ?? range.from)
      to.setHours(23, 59, 59, 999)

      const newValues = {
        ...values,
        [startKey]: from.toISOString(),
        [endKey]: to.toISOString(),
      }
      setValues(newValues)

      // Only apply if both dates are selected
      if (range.to) applyFilters(newValues)
    } else {
      const newValues = { ...values, [startKey]: "", [endKey]: "" }
      setValues(newValues)
      applyFilters(newValues)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newValues = { ...values, [startKey]: "", [endKey]: "" }
    setValues(newValues)
    applyFilters(newValues)
  }

  return (
    <Popover>
      <PopoverTrigger asChild id={id}>
        <Button
          variant="outline"
          disabled={isPending}
          className={cn(
            "h-8 w-full justify-start text-left font-light",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-px size-4 opacity-50" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "LLL dd, y")} -{" "}
                {format(date.to, "LLL dd, y")}
              </>
            ) : (
              format(date.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date range</span>
          )}
          {date && (
            <span
              className="z-50 ml-auto cursor-pointer p-1"
              onClick={handleClear}
            >
              <X className="size-3.5" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          autoFocus
          defaultMonth={date?.from}
          mode="range"
          selected={date}
          captionLayout="dropdown"
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  )
}

export default DateRangeFilter
