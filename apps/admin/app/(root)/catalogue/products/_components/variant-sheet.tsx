"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@bs42/ui/components/sheet"
import { Control, FieldValues, Path, UseFormClearErrors } from "react-hook-form"
import InputField from "@bs42/ui/components/input-field"
import NumberField from "@bs42/ui/components/number-field"
import ImageField from "@bs42/ui/components/image-field"
import { FieldGroup } from "@bs42/ui/components/field"
import { Badge } from "@bs42/ui/components/badge"
import { Separator } from "@bs42/ui/components/separator"
import { deleteFilesAction, uploadImagesAction } from "@/lib/actions/storage.actions"

interface VariantSheetProps<T extends FieldValues> {
  open: boolean
  onOpenChange: (open: boolean) => void
  index: number
  control: Control<T>
  attributes: Record<string, string>
  images: string[]
  clearErrors: UseFormClearErrors<T>
}

const VariantSheet = <T extends FieldValues>({ open, onOpenChange, index, control, attributes, images, clearErrors }: VariantSheetProps<T>) => {
  const handleAddImages = async (data: FileList) => {
    const formData = new FormData()
    Array.from(data).forEach((file) => formData.append("files", file))
    return uploadImagesAction(formData)
  }

  const handleRemoveImage = async (url: string) => {
    await deleteFilesAction([url])
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="min-w-full sm:min-w-125">
        <SheetHeader>
          <SheetTitle className="text-lg">Edit Variant</SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>

        <div className="grid gap-6 overflow-y-auto px-4 pb-5">
          {/* Attributes */}
          <div className="mt-1 flex flex-wrap gap-1">
            {Object.entries(attributes).map(([key, value]) => (
              <Badge key={key} variant="secondary">
                {key}: {value}
              </Badge>
            ))}
          </div>
          {/* Details */}
          <div className="grid gap-y-4">
            <h3 className="text-sm font-medium">Details</h3>
            <FieldGroup>
              <InputField control={control} name={`variants.${index}.sku` as Path<T>} label="SKU" placeholder="eg: TSHIRT-RED-L" />
              <InputField control={control} name={`variants.${index}.barcode` as Path<T>} label="Barcode" placeholder="e.g. 123456789" />
            </FieldGroup>
          </div>

          <Separator />

          {/* Shipping */}
          <div className="grid gap-y-4">
            <h3 className="text-sm font-medium">Shipping</h3>
            <FieldGroup>
              <NumberField control={control} name={`variants.${index}.weight` as Path<T>} label="Weight (kg)" step={0.01} />
              <InputField control={control} name={`variants.${index}.dimensions` as Path<T>} label="Dimensions" placeholder="e.g. 10x5x3 cm" />
            </FieldGroup>
          </div>

          <Separator />

          {/* Images */}
          <div className="grid gap-y-4">
            <h3 className="text-sm font-medium">Images</h3>
            <ImageField
              control={control}
              name={`variants.${index}.images` as Path<T>}
              maxImages={4}
              sizeLimit={100}
              onAdd={handleAddImages}
              onRemove={handleRemoveImage}
              clearErrors={clearErrors}
              className="w-full"
              defaultValues={images}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default VariantSheet
