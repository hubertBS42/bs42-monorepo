"use client"
import { Control, Controller, FieldValues, Path } from "react-hook-form"
import { Textarea } from "./textarea"
import React from "react"
import { Field, FieldDescription, FieldError, FieldLabel } from "./field"

interface TextAreaFieldProps<
  T extends FieldValues,
> extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  control: Control<T>
  name: Path<T>
  label?: string
  description?: string
}

const TextAreaField = <T extends FieldValues>({
  control,
  name,
  description,
  label,
  ...textAreaProps
}: TextAreaFieldProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field className="grid gap-y-1" data-invalid={fieldState.invalid}>
          {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}

          <Textarea {...textAreaProps} {...field} id={name} />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}

export default TextAreaField
