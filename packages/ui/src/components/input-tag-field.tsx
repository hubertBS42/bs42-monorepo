"use client"

import { Control, Controller, FieldValues, Path } from "react-hook-form"
import { Field, FieldDescription, FieldError, FieldLabel } from "./field"
import { Input } from "./input"
import { Badge } from "./badge"
import { X } from "lucide-react"
import { KeyboardEvent, useState } from "react"
import { cn } from "../lib/utils"

interface InputTagFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label?: string
  description?: string
  placeholder?: string
  disabled?: boolean
  className?: string
}

const InputTagField = <T extends FieldValues>({ control, name, label, description, placeholder = "Add tag...", disabled, className }: InputTagFieldProps<T>) => {
  const [inputValue, setInputValue] = useState("")

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const tags: string[] = field.value ?? []

        const addTag = (value: string) => {
          const trimmed = value.trim()
          if (!trimmed || tags.includes(trimmed)) return
          field.onChange([...tags, trimmed])
          setInputValue("")
        }

        const removeTag = (tag: string) => {
          field.onChange(tags.filter((t) => t !== tag))
        }

        const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            addTag(inputValue)
          }
          if (e.key === "Backspace" && !inputValue && tags.length > 0) {
            removeTag(tags[tags.length - 1]!)
          }
        }

        return (
          <Field data-invalid={fieldState.invalid} className={cn("grid gap-y-1", className)}>
            {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
            <div
              className={cn(
                "flex min-h-9 flex-wrap gap-1.5 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-xs transition-colors focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 dark:bg-input/30",
                fieldState.invalid && "border-destructive focus-within:ring-destructive/50",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              {tags.map((tag) => (
                <Badge key={tag} className="gap-1 pr-1">
                  {tag}
                  {!disabled && (
                    <button type="button" onClick={() => removeTag(tag)} className="rounded-full hover:bg-muted" aria-label={`Remove ${tag}`}>
                      <X className="size-3" />
                    </button>
                  )}
                </Badge>
              ))}
              <Input
                id={name}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                  if (inputValue.trim()) addTag(inputValue)
                  field.onBlur()
                }}
                disabled={disabled}
                placeholder={tags.length === 0 ? placeholder : ""}
                aria-invalid={fieldState.invalid}
                className="h-auto min-w-20 flex-1 border-none bg-transparent! p-0 shadow-none focus-visible:ring-0"
              />
            </div>
            {description && <FieldDescription>{description}</FieldDescription>}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )
      }}
    />
  )
}

export default InputTagField
