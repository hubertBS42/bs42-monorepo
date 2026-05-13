import { Control, Controller, FieldValues, Path } from "react-hook-form"
import { Field, FieldDescription, FieldError, FieldLabel } from "@bs42/ui/components/field"
import RichTextEditor from "./rich-text-editor"
import { cn } from "@bs42/ui/lib/utils"

interface DescriptionFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label?: string
  description?: string
  disabled?: boolean
  placeholder?: string
}

const DescriptionField = <T extends FieldValues>({ control, name, description, label, disabled = false, placeholder }: DescriptionFieldProps<T>) => {
  const handleLabelClick = () => {
    if (!disabled) {
      const element = document.getElementById(name)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (element && (element as any).focusEditor) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(element as any).focusEditor()
      }
    }
  }

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field className="grid gap-1" data-invalid={fieldState.invalid}>
          {label && (
            <FieldLabel className={cn(disabled && "pointer-events-none")} onClick={handleLabelClick}>
              {label}
            </FieldLabel>
          )}
          <RichTextEditor onChange={field.onChange} value={field.value} id={name} disabled={disabled} placeholder={placeholder} />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}
export default DescriptionField
