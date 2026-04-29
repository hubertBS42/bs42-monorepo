"use client"

import { ChevronDownIcon } from "lucide-react"
import { Select as SelectPrimitive } from "radix-ui"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "./select"
import { PrimitiveOption, SelectOption } from "@bs42/types"
import { useEffect, useState } from "react"

const LoadingComponent = ({
  loadingPlaceholder,
}: {
  loadingPlaceholder?: string
}) => {
  return (
    <div className="flex h-8 w-full items-center justify-between gap-1.5 rounded-md border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
      <span className="font-light">{loadingPlaceholder || "..."}</span>
      <ChevronDownIcon className="size-4 opacity-50" />
    </div>
  )
}

interface ClientOnlySelectProps extends Omit<
  React.ComponentProps<typeof SelectPrimitive.Root>,
  "children"
> {
  options: PrimitiveOption[] | SelectOption[]
  size?: "sm" | "default"
  placeholder?: string
  loadingPlaceholder: string
  id: string
  side?: "top" | "bottom" | "left" | "right"
}

const ClientOnlySelect = ({
  value,
  options,
  size = "default",
  placeholder,
  loadingPlaceholder,
  side = "top",
  id,
  ...props
}: ClientOnlySelectProps) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true)
  }, [isMounted])

  if (!isMounted)
    return <LoadingComponent loadingPlaceholder={loadingPlaceholder} />

  // Normalize options
  const normalizedOptions: SelectOption[] = options.map((option) => {
    if (typeof option === "object" && "label" in option && "value" in option) {
      return option
    }
    // Primitive type (string or number)
    return { label: String(option), value: String(option) }
  })

  return (
    <Select value={value as string} {...props}>
      <SelectTrigger size={size} className="w-full" id={id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent side={side}>
        {normalizedOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default ClientOnlySelect
