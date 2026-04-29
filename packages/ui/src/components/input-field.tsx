import { Control, Controller, FieldValues, Path } from "react-hook-form"
import { Field, FieldDescription, FieldError, FieldLabel } from "./field"
import { Input } from "./input"
import React from "react"

interface InputFieldProps<
  T extends FieldValues,
> extends React.InputHTMLAttributes<HTMLInputElement> {
  control: Control<T>
  name: Path<T>
  label?: string
  description?: string
}

const InputField = <T extends FieldValues>({
  control,
  name,
  description,
  label,
  ...inputProps
}: InputFieldProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="grid gap-y-1">
          {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
          <Input
            {...field}
            id={name}
            aria-invalid={fieldState.invalid}
            {...inputProps}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}

export default InputField
