"use client"

import { useState, useCallback, useRef, ChangeEvent } from "react"
import { Control, Controller, FieldValues, Path, UseFormClearErrors } from "react-hook-form"
import { ImageIcon, Loader, X } from "lucide-react"
import { Input } from "./input"
import { Button } from "@bs42/ui/components/button"
import { cn } from "../lib/utils"
import { ACCEPTED_IMAGE_TYPES } from "../constants"
import { Field, FieldDescription, FieldError, FieldLabel } from "./field"

const ImageTile = ({ image, isDeleting, isDisabled, handleRemove }: { image: string; isDeleting: boolean; isDisabled?: boolean; handleRemove: () => void }) => {
  return (
    <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-md border">
      {isDeleting && (
        <div className="absolute top-0 right-0 bottom-0 left-0 z-10 flex items-center justify-center bg-accent/60">
          <Loader className="size-6 animate-spin" />
        </div>
      )}
      <img src={image} alt="Preview image" className="h-full w-full rounded-md object-cover" />
      {(!isDeleting || !isDisabled) && (
        <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 size-6" onClick={() => handleRemove()}>
          <X />
        </Button>
      )}
    </div>
  )
}

const PlaceHolderTile = ({ isLoading, handleClick }: { isLoading: boolean; handleClick: () => void }) => {
  return (
    <div
      className={cn("relative flex aspect-square items-center justify-center overflow-hidden rounded-md border", isLoading ? "pointer-events-none" : "cursor-pointer")}
      onClick={() => handleClick()}
    >
      {isLoading ? (
        <div className="absolute top-0 right-0 bottom-0 left-0 z-10 flex items-center justify-center bg-accent/60">
          <Loader className="size-6 animate-spin" />
        </div>
      ) : (
        <ImageIcon className="size-6 text-muted-foreground" />
      )}
    </div>
  )
}

interface ImageUploaderProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label?: string
  description?: string
  className?: string
  disabled?: boolean
  maxImages?: number
  sizeLimit?: number
  defaultValues?: string | string[] | null
  onAdd: (images: FileList) => Promise<string[]>
  onRemove: (url: string) => Promise<void>
  clearErrors: UseFormClearErrors<T>
}

const ImageField = <T extends FieldValues>({
  control,
  name,
  description,
  label,
  className,
  disabled,
  maxImages = 1,
  sizeLimit = 1000, // 1 Mb in Kb
  defaultValues,
  onAdd,
  onRemove,
  clearErrors,
}: ImageUploaderProps<T>) => {
  const [previews, setPreviews] = useState<string[]>(!defaultValues ? [] : typeof defaultValues === "string" ? [defaultValues] : defaultValues)
  const [imageToBeDeletedIndex, setImageToBeDeletedIndex] = useState<number | null>(null)
  const [newImagesSlots, setNewImagesSlots] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>, onChange: (newData: string | string[]) => void, existingData: string | string[] | null) => {
      if (e.target.files) {
        // Check file size
        for (const file of e.target.files) {
          if (file.size > sizeLimit * 1024) {
            control.setError(name, {
              type: "custom",
              message: maxImages > 1 ? `Each image must be ${sizeLimit}KB or smaller.` : `Image must be ${sizeLimit}KB or smaller`,
            })

            return
          }
        }

        const normalizedExistingData = !existingData || typeof existingData === "string" ? [] : existingData

        if (e.target.files.length + normalizedExistingData.length > maxImages) {
          control.setError(name, {
            type: "custom",
            message: `You're allowed to upload up to ${maxImages} image${maxImages > 1 && "s"}.`,
          })
          return
        }

        clearErrors(name)
        setIsLoading(true)

        // Specify pending images slots
        const newImagesIndices = Array.from({ length: e.target.files.length }, (_, i) => normalizedExistingData.length + i)
        setNewImagesSlots(newImagesIndices)
        const uploadedImages = await onAdd(e.target.files)

        setIsLoading(false)
        setNewImagesSlots([])

        const combinedImages = [...normalizedExistingData, ...uploadedImages]
        onChange(maxImages === 1 ? combinedImages[0]! : combinedImages)
        setPreviews(combinedImages)
      }
    },
    [maxImages, clearErrors, control, name, sizeLimit, onAdd]
  )

  const removeImage = useCallback(
    async (index: number, onChange: (newData: string[] | string) => void) => {
      clearErrors(name)
      setIsLoading(true)
      setImageToBeDeletedIndex(index)

      await onRemove(previews[index]!)

      setIsLoading(false)
      setImageToBeDeletedIndex(null)
      const filtered = previews.filter((image) => image !== previews[index])
      setPreviews(filtered)
      onChange(maxImages === 1 && filtered.length === 0 ? "" : filtered)

      // Clear the file input value to allow re-adding the same file
      if (imageInputRef.current) {
        imageInputRef.current.value = ""
      }

      // if (onRemove) onRemove(imageToRemove)
    },
    [onRemove, previews, clearErrors, name, maxImages]
  )

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value, ref, ...field }, fieldState }) => {
        const assignInputRef = (el: HTMLInputElement | null) => {
          imageInputRef.current = el
          ref(el) // this is the react-hook-form field ref
        }

        return (
          <Field className="grid gap-y-1" data-invalid={fieldState.invalid}>
            {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}

            <Input
              type="file"
              multiple={maxImages > 1 ? true : false}
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              className="hidden"
              onChange={(e) => handleFileChange(e, onChange, value)}
              disabled={disabled}
              ref={assignInputRef}
              id={name}
              {...field}
            />
            <div
              className={cn("gap-x-1.5", className)}
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${maxImages}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: maxImages }, (_, i) => {
                if (previews[i]) {
                  return <ImageTile key={i} handleRemove={() => removeImage(i, onChange)} image={previews[i]} isDeleting={imageToBeDeletedIndex === i && isLoading} />
                } else {
                  return <PlaceHolderTile key={i} isLoading={newImagesSlots.includes(i) && isLoading} handleClick={() => imageInputRef.current?.click()} />
                }
              })}
            </div>

            {description && <FieldDescription>{description}</FieldDescription>}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )
      }}
    />
  )
}

export default ImageField
