import { InputHTMLAttributes, useCallback, useState } from "react"
import { Field, FieldDescription, FieldError, FieldLabel } from "./field"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText } from "./input-group"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"

interface NumberFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "min" | "max" | "step"> {
  value?: number
  onChange?: (value: number) => void
  label?: string
  description?: string
  error?: string
  min?: number
  max?: number
  step?: number
  prependText?: string
}

const NumberField = ({ value, onChange, label, description, error, min = 0, max, step = 1, prependText, id, ...inputProps }: NumberFieldProps) => {
  // null = not mid-edit, derive from value prop; string = user is typing
  const [localValue, setLocalValue] = useState<string | null>(null)

  const roundToPrecision = useCallback((val: number, s: number): number => {
    const stepStr = s.toString()
    const decimalPlaces = stepStr.includes(".") ? stepStr.split(".")[1]!.length : 0
    const multiplier = Math.pow(10, decimalPlaces)
    return Math.round(val * multiplier) / multiplier
  }, [])

  const clamp = useCallback(
    (val: number): number => {
      if (min !== undefined && val < min) return min
      if (max !== undefined && val > max) return max
      return val
    },
    [min, max]
  )

  const commit = useCallback(
    (val: number) => {
      const committed = clamp(roundToPrecision(val, step))
      setLocalValue(null)
      onChange?.(committed)
    },
    [clamp, roundToPrecision, step, onChange]
  )

  const current = Number(value ?? 0)
  // While the user is typing, show their raw input; otherwise derive from the controlled value
  const displayValue = localValue !== null ? localValue : String(current)
  const isAtMax = max !== undefined && current >= max
  const isAtMin = min !== undefined && current <= min

  return (
    <Field data-invalid={!!error} className="grid gap-y-1">
      {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
      <InputGroup className="relative overflow-hidden">
        <InputGroupInput
          {...inputProps}
          id={id}
          type="number"
          min={min}
          max={max}
          step={step}
          value={displayValue}
          aria-invalid={!!error}
          onChange={(e) => {
            const raw = e.target.value
            setLocalValue(raw)
            if (raw === "") return
            onChange?.(clamp(roundToPrecision(Number(raw), step)))
          }}
          onBlur={() => {
            if (localValue === "" || localValue === null) {
              commit(localValue === "" ? (min ?? 0) : current)
            } else {
              commit(Number(localValue))
            }
          }}
          onFocus={() => {
            // Seed local value from current; clear if zero for nicer UX
            setLocalValue(current === 0 ? "" : String(current))
          }}
        />
        {prependText && (
          <InputGroupAddon>
            <InputGroupText>{prependText}</InputGroupText>
          </InputGroupAddon>
        )}
        <InputGroupAddon align="inline-end" className="flex h-[calc(100%+2px)] flex-col gap-0 pr-1">
          <InputGroupButton
            type="button"
            aria-label="Increase"
            title="Increase"
            className="h-1/2 w-8 flex-1 items-center justify-center rounded-none border text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => commit(current + step)}
            disabled={isAtMax}
          >
            <ChevronUpIcon className="size-3" />
          </InputGroupButton>
          <InputGroupButton
            type="button"
            aria-label="Decrease"
            title="Decrease"
            className="h-1/2 w-8 flex-1 items-center justify-center rounded-none border text-sm transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => commit(current - step)}
            disabled={isAtMin}
          >
            <ChevronDownIcon className="size-3" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError errors={[{ message: error }]} />}
    </Field>
  )
}

export default NumberField
