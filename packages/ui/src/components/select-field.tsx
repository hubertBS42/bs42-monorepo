"use client"
import { Control, Controller, FieldValues, Path } from "react-hook-form"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select"
import { Field, FieldDescription, FieldError, FieldLabel } from "./field"
import { ChevronDownIcon } from "lucide-react"
import { PrimitiveOption, SelectOption } from "@bs42/types"
import { useEffect, useState } from "react"

interface SelectFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label?: string
  placeholder?: string
  size?: "sm" | "default"
  loadingPlaceholder: string
  description?: string
  className?: string
  disabled?: boolean
  options: PrimitiveOption[] | SelectOption[]
  side?: "top" | "bottom" | "left" | "right"
}

const PlaceholderComponent = ({
  placeholderLabel,
  placeholderText,
}: {
  placeholderLabel?: string
  placeholderText?: string
}) => {
  return (
    <Field className="flex flex-col gap-1">
      {placeholderLabel && <FieldLabel>{placeholderLabel}</FieldLabel>}
      <div className="flex h-9 w-full items-center justify-between gap-1.5 rounded-md border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap text-muted-foreground shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
        {placeholderText || "..."}
        <ChevronDownIcon className="pointer-events-none size-4" />
      </div>
    </Field>
  )
}

const SelectField = <T extends FieldValues>({
  control,
  name,
  description,
  label,
  side,
  size,
  placeholder,
  loadingPlaceholder,
  options,
  ...selectProps
}: SelectFieldProps<T>) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true)
  }, [isMounted])

  if (!isMounted) {
    return (
      <PlaceholderComponent
        placeholderLabel={label}
        placeholderText={loadingPlaceholder}
      />
    )
  }

  // Normalize options
  const normalizedOptions: SelectOption[] = options.map((option) => {
    if (typeof option === "object" && "label" in option && "value" in option) {
      return option
    }
    // Primitive type (string or number)
    return { label: String(option), value: String(option) }
  })

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field className="grid gap-1" data-invalid={fieldState.invalid}>
          {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
          <Select
            onValueChange={field.onChange}
            value={field.value}
            {...selectProps}
          >
            <SelectTrigger size={size} className="w-full" id={name}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent side={side}>
              <SelectGroup>
                {normalizedOptions.map((option, idx) => (
                  <SelectItem key={idx} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}
export default SelectField
