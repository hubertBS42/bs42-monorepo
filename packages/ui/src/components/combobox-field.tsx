"use client"
import { Control, Controller, FieldValues, Path } from "react-hook-form"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Button } from "./button"
import { cn } from "../lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "./command"
import { CheckIcon, ChevronsUpDown } from "lucide-react"
import { useState } from "react"
import { Field, FieldDescription, FieldError, FieldLabel } from "./field"

interface ComboboxFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label?: string
  placeholder: string
  searchPlaceholder: string
  description?: string
  options: { label: string; value: string }[]
  disabled?: boolean
  modal?: boolean
  onChange?: (value: string) => void
}

const ComboboxField = <T extends FieldValues>({
  control,
  name,
  description,
  label,
  placeholder,
  searchPlaceholder,
  options,
  disabled,
  modal = false,
  onChange,
}: ComboboxFieldProps<T>) => {
  const [open, setOpen] = useState(false)
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field className="grid gap-y-1" data-invalid={fieldState.invalid}>
          {label && (
            <FieldLabel htmlFor={name} className={cn(disabled && "pointer-events-none")}>
              {label}
            </FieldLabel>
          )}
          <Popover open={open} onOpenChange={setOpen} modal={modal}>
            <PopoverTrigger id={name} asChild>
              <Button variant="outline" role="combobox" className={cn("w-full justify-between font-light", !field.value && "text-muted-foreground")} disabled={disabled}>
                {field.value ? options.find((option) => option.value === field.value)?.label : placeholder}
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="PopoverContent">
              <Command>
                <CommandInput placeholder={searchPlaceholder} className="h-9" />
                <CommandList>
                  <CommandEmpty>No data found.</CommandEmpty>
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        value={option.value}
                        key={option.value}
                        onSelect={() => {
                          if (onChange) {
                            onChange(option.value)
                          }
                          field.onChange(option.value)
                          setOpen(false)
                        }}
                      >
                        {option.label}
                        <CommandShortcut>
                          <CheckIcon className={cn("ml-auto h-4 w-4", option.value === field.value ? "opacity-100" : "opacity-0")} />
                        </CommandShortcut>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}
export default ComboboxField
