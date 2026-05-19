"use client"
import ComboboxField from "@bs42/ui/components/combobox-field"
import InputField from "@bs42/ui/components/input-field"
import SwitchField from "@bs42/ui/components/switch-field"
import { Button } from "@bs42/ui/components/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@bs42/ui/components/dialog"
import { Spinner } from "@bs42/ui/components/spinner"
import { GEODATA } from "@bs42/ui/constants"
import { addAddressAction } from "@/lib/actions/user.actions"
import { addAddressFormSchema } from "@/lib/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { SubmitHandler, useForm, useWatch } from "react-hook-form"
import { toast } from "@bs42/ui/components/sonner"
import { z } from "zod"
import PhoneField from "@bs42/ui/components/phone-field"

const AddAddressDialog = ({ userId }: { userId: string }) => {
  const [isPending, startTransition] = useTransition()
  const [towns, setTowns] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof addAddressFormSchema>>({
    resolver: zodResolver(addAddressFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      line1: "",
      line2: "",
      region: "",
      town: "",
      latitude: 0,
      longitude: 0,
      isDefault: false,
    },
  })

  const onSubmit: SubmitHandler<z.infer<typeof addAddressFormSchema>> = async (values) => {
    startTransition(async () => {
      const response = await addAddressAction({ userId, data: values })

      if (!response.success) {
        toast.error("Operation failed", { description: response.error })
      } else {
        startTransition(() => {
          form.reset()
          setOpen(false)
          router.refresh()
          toast.success("Address added successfully.")
        })
      }
    })
  }

  const selectedRegion = useWatch({ control: form.control, name: "region" })

  useEffect(() => {
    form.setValue("town", "")
    const regionTowns = GEODATA.find((region) => region.name === selectedRegion)?.towns || []
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTowns(regionTowns)
  }, [selectedRegion, form])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" type="button">
          <PlusCircle className="h-3.5 w-3.5" />
          Add address
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add an address</DialogTitle>
          <DialogDescription>Lorem ipsum dolor sit, amet consectetur adipisicing elit.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <InputField control={form.control} label="Full name" name="name" disabled={isPending} />
            </div>

            <div className="col-span-2">
              <PhoneField control={form.control} label="Phone" name="phone" disabled={isPending} defaultCountry="GH" />
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
                searchPlaceholder="Seach regions..."
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
                searchPlaceholder="Seach towns.."
                modal
              />
            </div>

            <div>
              <SwitchField control={form.control} label="Set as default" name="isDefault" />
            </div>

            <div className="col-span-2">
              <Button className="w-full" type="button" onClick={() => form.handleSubmit(onSubmit)()} disabled={isPending}>
                {isPending ? <Spinner /> : "Add address"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
export default AddAddressDialog
