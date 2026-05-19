"use client"
import { Control, Controller, FieldValues, Path } from "react-hook-form"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { CalendarIcon, XCircle } from "lucide-react"
import { Calendar } from "./calendar"
import { cn } from "../lib/utils"
import { Matcher } from "react-day-picker"
import { Button } from "./button"
import { Field, FieldDescription, FieldError, FieldLabel } from "./field"
import { format } from "date-fns"
import { useState } from "react"

interface DateFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label?: string
  description?: string
  disabled?: boolean
  disabledDates?: Matcher | Matcher[] | undefined
  clearable?: boolean
}

const DateField = <T extends FieldValues>({ control, name, description, label, disabled, disabledDates, clearable = true }: DateFieldProps<T>) => {
  const [open, setOpen] = useState(false)
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field className="grid gap-1" data-invalid={fieldState.invalid}>
          {label && (
            <FieldLabel className={cn(disabled && "pointer-events-none")} htmlFor={name}>
              {label}
            </FieldLabel>
          )}
          <div className="relative">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger id={name} asChild>
                <Button variant={"outline"} className={cn("w-full justify-start text-left font-light", !field.value && "text-muted-foreground")} disabled={disabled}>
                  <CalendarIcon className="mr-px size-4 opacity-50" />
                  {field.value ? format(field.value, "LLL dd, y") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => {
                    field.onChange(date)
                    setOpen(false)
                  }}
                  month={field.value || undefined}
                  defaultMonth={field.value || undefined}
                  disabled={disabledDates}
                  captionLayout="dropdown"
                  autoFocus
                />
                {clearable && field.value && (
                  <div className="border-t p-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        field.onChange(undefined)
                        setOpen(false)
                      }}
                    >
                      <XCircle className="mr-2 size-3" />
                      Clear date
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
            {clearable && field.value && !disabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-0 right-0 h-full rounded-l-none px-3"
                onClick={(e) => {
                  e.stopPropagation()
                  field.onChange(undefined)
                }}
              >
                <XCircle className="size-4 opacity-50 hover:opacity-100" />
              </Button>
            )}
          </div>
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}

export default DateField
