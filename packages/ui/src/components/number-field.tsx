import { Control, Controller, FieldValues, Path } from "react-hook-form"
import { Field, FieldDescription, FieldError, FieldLabel } from "./field"
import { InputHTMLAttributes, useCallback } from "react"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText } from "./input-group"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"

interface NumberFieldProps<T extends FieldValues> extends InputHTMLAttributes<HTMLInputElement> {
  control: Control<T>
  name: Path<T>
  label?: string
  description?: string
  min?: number
  max?: number
  step?: number
  prependText?: string
  onValueChange?: (value: number) => void
}

const NumberField = <T extends FieldValues>({ control, name, description, label, min = 0, max, step = 1, prependText, onValueChange, ...inputProps }: NumberFieldProps<T>) => {
  // Helper function to round to specific decimal places (fixes floating point issues)
  const roundToPrecision = useCallback((value: number, step: number): number => {
    // Determine decimal places from step
    const stepStr = step.toString()
    const decimalPlaces = stepStr.includes(".") ? stepStr.split(".")[1]!.length : 0

    // Round to that many decimal places
    const multiplier = Math.pow(10, decimalPlaces)
    return Math.round(value * multiplier) / multiplier
  }, [])

  // Handle increment with validation
  const handleIncrement = useCallback(
    (currentValue: number, onChange: (value: number) => void) => {
      const current = Number(currentValue || 0)
      const newValue = roundToPrecision(current + step, step)
      const finalValue = max !== undefined && newValue > max ? max : newValue
      onChange(finalValue)
      onValueChange?.(finalValue)
    },
    [max, step, roundToPrecision, onValueChange]
  )

  // Handle decrement with validation
  const handleDecrement = useCallback(
    (currentValue: number, onChange: (value: number) => void) => {
      const current = Number(currentValue || 0)
      const newValue = roundToPrecision(current - step, step)
      const finalValue = min !== undefined && newValue < min ? min : newValue
      onChange(finalValue)
      onValueChange?.(finalValue)
    },
    [min, step, roundToPrecision, onValueChange]
  )
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="grid gap-y-1">
          {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
          <InputGroup className="relative overflow-hidden">
            {prependText && (
              <InputGroupAddon>
                <InputGroupText>{prependText}</InputGroupText>
              </InputGroupAddon>
            )}
            <InputGroupInput
              {...field}
              value={field.value ?? ""}
              id={name}
              aria-invalid={fieldState.invalid}
              type="number"
              min={min}
              max={max}
              step={step}
              {...inputProps}
              onChange={(e) => {
                // Parse and validate on manual input
                const inputValue = e.target.value

                // Allow empty string for better UX
                if (inputValue === "") {
                  field.onChange("")
                  return
                }

                let value = Number(inputValue)

                // Round to step precision to avoid floating point issues
                value = roundToPrecision(value, step)

                // Enforce min/max constraints
                if (min !== undefined && value < min) value = min
                if (max !== undefined && value > max) value = max

                field.onChange(value)
                onValueChange?.(value)
              }}
              onBlur={(e) => {
                field.onBlur()
                if (e.target.value === "") {
                  field.onChange(min ?? 0)
                }
              }}
              onFocus={(e) => {
                const value = e.target.value
                if (Number(value) === 0) {
                  field.onChange("")
                }
              }}
            />

            <InputGroupAddon align="inline-end" className="flex h-[calc(100%+2px)] flex-col gap-0 pr-1">
              <InputGroupButton
                type="button"
                aria-label="Increase"
                title="Increase"
                className="h-1/2 w-8 flex-1 items-center justify-center rounded-none border text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => handleIncrement(field.value, field.onChange)}
                disabled={max !== undefined && Number(field.value || 0) >= max}
              >
                <ChevronUpIcon className="size-3" />
              </InputGroupButton>
              <InputGroupButton
                type="button"
                aria-label="Decrease"
                title="Decrease"
                className="h-1/2 w-8 flex-1 items-center justify-center rounded-none border text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => handleDecrement(field.value, field.onChange)}
                disabled={min !== undefined && Number(field.value || 0) <= min}
              >
                <ChevronDownIcon className="size-3" />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}
export default NumberField
