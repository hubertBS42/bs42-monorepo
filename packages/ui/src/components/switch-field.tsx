import { Control, Controller, FieldValues, Path } from "react-hook-form"
import { Switch } from "./switch"
import { Field, FieldDescription, FieldError, FieldLabel } from "./field"

interface SwitchFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label?: string
  description?: string
  disabled?: boolean
}

const SwitchField = <T extends FieldValues>({ control, name, description, label, disabled }: SwitchFieldProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field className="grid gap-y-1" data-invalid={fieldState.invalid}>
          <div className="flex gap-x-2">
            <Switch checked={field.value} onCheckedChange={field.onChange} disabled={disabled} id={name} />

            {label && (
              <FieldLabel htmlFor={name} className="font-light">
                {label}
              </FieldLabel>
            )}
          </div>
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}
export default SwitchField
