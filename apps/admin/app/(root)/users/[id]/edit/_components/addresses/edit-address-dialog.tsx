"use client"
import { Button } from "@bs42/ui/components/button"
import { updateAddressAction } from "@/lib/actions/user.actions"
import { updateAddressFormSchema } from "@/lib/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dispatch, memo, SetStateAction, useEffect, useState, useTransition } from "react"
import { SubmitHandler, useForm, useWatch } from "react-hook-form"
import { toast } from "@bs42/ui/components/sonner"
import { z } from "zod"
import { GEODATA } from "@bs42/ui/constants"
import InputField from "@bs42/ui/components/input-field"
import SwitchField from "@bs42/ui/components/switch-field"
import ComboboxField from "@bs42/ui/components/combobox-field"
import { Spinner } from "@bs42/ui/components/spinner"
import { useRouter } from "next/navigation"
import { Address } from "@bs42/db/client"

const EditAddressDialog = ({ address, setDialogIsOpen }: { address: Address; setDialogIsOpen: Dispatch<SetStateAction<boolean>> }) => {
  const [isPending, startTransition] = useTransition()
  const [towns, setTowns] = useState<string[]>([])
  const router = useRouter()

  const form = useForm<z.infer<typeof updateAddressFormSchema>>({
    resolver: zodResolver(updateAddressFormSchema),
    defaultValues: {
      ...address,
      line2: address.line2 || "",
    },
  })

  const onSubmit: SubmitHandler<z.infer<typeof updateAddressFormSchema>> = async (values) => {
    startTransition(async () => {
      const response = await updateAddressAction({ userId: address.userId, data: values })

      if (!response.success) {
        toast.error("Operation failed", { description: response.error })
      } else {
        startTransition(() => {
          form.reset()
          setDialogIsOpen(false)
          router.refresh()
          toast.success("Address updated successfully.")
        })
      }
    })
  }

  const selectedRegion = useWatch({ control: form.control, name: "region" })

  useEffect(() => {
    if (selectedRegion !== address.region) form.setValue("town", "")
    const regionTowns = GEODATA.find((region) => region.name === selectedRegion)?.towns || []
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTowns(regionTowns)
  }, [selectedRegion, form, address.region])

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <InputField control={form.control} label="Full name" name="name" disabled={isPending} />
        </div>

        <div className="col-span-2">
          <InputField control={form.control} label="Phone" name="phone" disabled={isPending} />
        </div>

        <div className="col-span-2">
          <InputField control={form.control} label="Full address" name="line1" disabled={isPending} />
        </div>

        <div className="col-span-2">
          <InputField control={form.control} label="Other address details" name="line2" disabled={isPending} />
        </div>
        <div>
          <ComboboxField
            control={form.control}
            label="Region"
            name="region"
            disabled={isPending}
            options={GEODATA.map((data) => ({ label: data.name, value: data.name }))}
            placeholder="Select a region"
            searchPlaceholder="Search region..."
            modal
          />
        </div>
        <div>
          <ComboboxField
            control={form.control}
            label="Town"
            name="town"
            disabled={isPending || !selectedRegion}
            options={towns.map((town) => ({ label: town, value: town }))}
            placeholder="Select a town"
            searchPlaceholder="Search towns..."
            modal
          />
        </div>
        {!address.isDefault && (
          <div>
            <SwitchField control={form.control} label="Set as default" name="isDefault" />
          </div>
        )}

        <div className="col-span-2">
          <Button className="w-full" type="button" onClick={() => form.handleSubmit(onSubmit)()} disabled={isPending}>
            {isPending ? <Spinner /> : "Update address"}
          </Button>
        </div>
      </div>
    </form>
  )
}
export default memo(EditAddressDialog)
