import { Control, Controller, FieldValues, Path } from "react-hook-form"
import { flattenNodeTree } from "@bs42/utils"
import { TreeNode } from "@bs42/types"
import { Field, FieldDescription, FieldError, FieldLabel } from "./field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { ChevronDownIcon } from "lucide-react"
import { useEffect, useState } from "react"

interface SelectTreePickerFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label?: string
  placeholder?: string
  size?: "sm" | "default"
  loadingPlaceholder: string
  description?: string
  className?: string
  disabled?: boolean
  options: TreeNode<{
    label: string
    value: string
    id: string
    parentId: string | null
  }>[]
  disabledOptions?: string[]
  side?: "top" | "bottom" | "left" | "right"
}

const PlaceholderComponent = ({ placeholderLabel, placeholderText }: { placeholderLabel?: string; placeholderText?: string }) => {
  return (
    <Field className="flex flex-col gap-1">
      {placeholderLabel && <FieldLabel>{placeholderLabel}</FieldLabel>}
      <div className="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground">
        <span className="font-light">{placeholderText || "..."}</span>
        <ChevronDownIcon className="size-4 opacity-50" />
      </div>
    </Field>
  )
}

const SelectTreeField = <T extends FieldValues>({
  control,
  name,
  description,
  label,
  side,
  placeholder,
  loadingPlaceholder,
  options,
  disabledOptions,
  size,
  ...selectProps
}: SelectTreePickerFieldProps<T>) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <PlaceholderComponent placeholderLabel={label} placeholderText={loadingPlaceholder} />
  }
  const flatOptions = flattenNodeTree(options)

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field className="grid gap-1" data-invalid={fieldState.invalid}>
          {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
          <Select onValueChange={field.onChange} value={field.value} {...selectProps}>
            <SelectTrigger size={size} className="w-full" id={name}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent side={side}>
              {flatOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={disabledOptions && disabledOptions.includes(option.value)}
                  style={{ paddingLeft: `${8 + option.depth * 16}px` }}
                >
                  {/* {'—'.repeat(option.depth)}  */}
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}

export default SelectTreeField
