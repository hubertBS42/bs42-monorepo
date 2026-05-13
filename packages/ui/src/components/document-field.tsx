"use client"

import { useState, useRef, useCallback, ChangeEvent } from "react"
import { Control, Controller, FieldValues, Path, UseFormClearErrors } from "react-hook-form"
import { Field, FieldDescription, FieldError, FieldLabel } from "./field"
import { Input } from "./input"
import { Button } from "./button"
import { FileIcon, Loader, X } from "lucide-react"
import { cn } from "../lib/utils"

const ACCEPTED_DOCUMENT_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]

interface DocumentItem {
  name: string
  url: string
}

interface DocumentTileProps {
  document: DocumentItem
  isDeleting: boolean
  isDisabled?: boolean
  handleRemove: () => void
}

const DocumentTile = ({ document, isDeleting, isDisabled, handleRemove }: DocumentTileProps) => {
  return (
    <div className="flex items-center gap-3 rounded-md border px-3 py-2">
      {isDeleting ? <Loader className="size-4 shrink-0 animate-spin text-muted-foreground" /> : <FileIcon className="size-4 shrink-0 text-muted-foreground" />}
      <a href={document.url} target="_blank" rel="noopener noreferrer" className="flex-1 truncate text-sm underline-offset-4 hover:underline">
        {document.name}
      </a>
      {!isDisabled && !isDeleting && (
        <Button type="button" variant="ghost" size="icon" className="size-6 shrink-0" onClick={handleRemove}>
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  )
}

const PlaceholderTile = ({ isLoading, handleClick }: { isLoading: boolean; handleClick: () => void }) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-md border border-dashed px-3 py-4 text-sm text-muted-foreground transition-colors",
        isLoading ? "pointer-events-none" : "cursor-pointer hover:bg-accent/50"
      )}
      onClick={handleClick}
    >
      {isLoading ? <Loader className="size-4 animate-spin" /> : <span>Click to upload document(s)</span>}
    </div>
  )
}

interface DocumentFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label?: string
  description?: string
  className?: string
  disabled?: boolean
  maxDocuments?: number
  sizeLimit?: number // in KB
  clearErrors: UseFormClearErrors<T>
  onAdd: (files: FileList) => Promise<DocumentItem[]>
  onRemove: (url: string) => Promise<void>
  defaultValues?: DocumentItem[]
}

const DocumentField = <T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  disabled,
  maxDocuments = 5,
  sizeLimit = 5000, // 5MB default
  clearErrors,
  onAdd,
  onRemove,
  defaultValues,
}: DocumentFieldProps<T>) => {
  const [previews, setPreviews] = useState<DocumentItem[]>(defaultValues ?? [])
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>, onChange: (value: DocumentItem[]) => void, existing: DocumentItem[]) => {
      if (!e.target.files?.length) return

      for (const file of e.target.files) {
        if (file.size > sizeLimit * 1024) {
          control.setError(name, {
            type: "custom",
            message: `Each file must be ${sizeLimit}KB or smaller.`,
          })
          return
        }
      }

      if (e.target.files.length + existing.length > maxDocuments) {
        control.setError(name, {
          type: "custom",
          message: `You can upload up to ${maxDocuments} document${maxDocuments > 1 ? "s" : ""}.`,
        })
        return
      }

      clearErrors(name)
      setIsLoading(true)

      const uploaded = await onAdd(e.target.files)

      setIsLoading(false)

      const combined = [...existing, ...uploaded]
      onChange(combined)
      setPreviews(combined)

      if (inputRef.current) inputRef.current.value = ""
    },
    [control, name, sizeLimit, maxDocuments, clearErrors, onAdd]
  )

  const handleRemove = useCallback(
    async (index: number, onChange: (value: DocumentItem[]) => void) => {
      clearErrors(name)
      setDeletingIndex(index)

      await onRemove(previews[index]!.url)

      setDeletingIndex(null)
      const filtered = previews.filter((_, i) => i !== index)
      setPreviews(filtered)
      onChange(filtered)

      if (inputRef.current) inputRef.current.value = ""
    },
    [previews, clearErrors, name, onRemove]
  )

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value, ref, ...field }, fieldState }) => {
        const existing: DocumentItem[] = value ?? []

        const assignRef = (el: HTMLInputElement | null) => {
          inputRef.current = el
          ref(el)
        }

        return (
          <Field className={cn("grid gap-y-1", className)} data-invalid={fieldState.invalid}>
            {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}

            <Input
              type="file"
              multiple={maxDocuments > 1}
              accept={ACCEPTED_DOCUMENT_TYPES.join(",")}
              className="hidden"
              onChange={(e) => handleFileChange(e, onChange, existing)}
              disabled={disabled}
              ref={assignRef}
              id={name}
              {...field}
            />

            <div className="grid gap-y-2">
              {previews.length < maxDocuments && <PlaceholderTile isLoading={isLoading && deletingIndex === null} handleClick={() => inputRef.current?.click()} />}
              {previews.map((doc, i) => (
                <DocumentTile key={doc.url} document={doc} isDeleting={deletingIndex === i} isDisabled={disabled} handleRemove={() => handleRemove(i, onChange)} />
              ))}
            </div>

            {description && <FieldDescription>{description}</FieldDescription>}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )
      }}
    />
  )
}

export default DocumentField
