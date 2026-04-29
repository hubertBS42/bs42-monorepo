"use client"
import { Control, Controller, FieldValues, Path } from "react-hook-form"
import { Field, FieldDescription, FieldError, FieldLabel } from "./field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./input-group"
import { Eye, EyeClosed } from "lucide-react"
import { useState } from "react"

interface PasswordFieldProps<
  T extends FieldValues,
> extends React.InputHTMLAttributes<HTMLInputElement> {
  control: Control<T>
  name: Path<T>
  label?: string
  description?: string
  resetPasswordSlot?: React.ReactNode
}

const PasswordField = <T extends FieldValues>({
  control,
  name,
  description,
  label,
  resetPasswordSlot,
  ...inputProps
}: PasswordFieldProps<T>) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="grid gap-y-1">
          {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
          <InputGroup>
            <InputGroupInput
              {...field}
              id={name}
              aria-invalid={fieldState.invalid}
              type={showPassword ? "text" : "password"}
              {...inputProps}
            />
            <InputGroupAddon align={"inline-end"}>
              <InputGroupButton
                aria-label={showPassword ? "Hide" : "Show"}
                title={showPassword ? "Hide" : "Show"}
                size="icon-xs"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeClosed /> : <Eye />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          {resetPasswordSlot}
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}

export default PasswordField
