import { Control, Controller, FieldValues, Path } from "react-hook-form"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "./calendar"
import { cn } from "../lib/utils"
import { Matcher } from "react-day-picker"
import { Button } from "./button"
import { Field, FieldDescription, FieldError, FieldLabel } from "./field"
import { format } from "date-fns"

interface DateFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label?: string
  description?: string
  disabled?: boolean
  disabledDates?: Matcher | Matcher[] | undefined
}

const DateField = <T extends FieldValues>({
  control,
  name,
  description,
  label,
  disabled,
  disabledDates,
}: DateFieldProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field className="grid gap-1" data-invalid={fieldState.invalid}>
          {label && (
            <FieldLabel
              className={cn(disabled && "pointer-events-none")}
              htmlFor={name}
            >
              {label}
            </FieldLabel>
          )}
          <Popover>
            <PopoverTrigger id={name} asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-light",
                  !field.value && "text-muted-foreground"
                )}
                disabled={disabled}
              >
                <CalendarIcon className="mr-px size-4 opacity-50" />
                {field.value ? (
                  format(field.value, "LLL dd, y")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={disabledDates}
                captionLayout="dropdown"
                autoFocus
              />
            </PopoverContent>
          </Popover>
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}

export default DateField
