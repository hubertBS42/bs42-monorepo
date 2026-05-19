"use client"

import { UseFormReturn } from "react-hook-form"
import { z } from "zod"
import { createOrderFormSchema } from "@/lib/zod"
import { Button } from "@bs42/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@bs42/ui/components/card"
import { FieldGroup } from "@bs42/ui/components/field"
import InputField from "@bs42/ui/components/input-field"
import NumberField from "@bs42/ui/components/number-field"
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react"
import { useCallback, useEffect, useState, useTransition } from "react"
import { Address } from "@bs42/db/client"
import { DataResponse } from "@bs42/types"
import { cn } from "@bs42/ui/lib/utils"
import PhoneField from "@bs42/ui/components/phone-field"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@bs42/ui/components/tabs"
import ComboboxField from "@bs42/ui/components/combobox-field"
import { GEODATA } from "@bs42/ui/constants"

type FormValues = z.infer<typeof createOrderFormSchema>

interface ShippingStepProps {
  form: UseFormReturn<FormValues>
  onBack: () => void
  onNext: () => void
}

const ShippingStep = ({ form, onBack, onNext }: ShippingStepProps) => {
  const [isPending, startTransition] = useTransition()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [addressTab, setAddressTab] = useState<"saved" | "manual">("manual")

  const userId = form.watch("userId")
  const customerName = form.watch("customerName")
  const customerPhone = form.watch("customerPhone")
  const shippingMethod = form.watch("shippingMethod")
  const shippingLine1 = form.watch("shippingLine1")
  const selectedRegion = form.watch("shippingRegion")

  const towns = GEODATA.find((region) => region.name === selectedRegion)?.towns ?? []

  const handleSelectAddress = useCallback(
    (address: Address) => {
      setSelectedAddressId(address.id)
      form.setValue("shippingName", address.name)
      form.setValue("shippingPhone", address.phone)
      form.setValue("shippingLine1", address.line1)
      form.setValue("shippingLine2", address.line2 ?? "")
      form.setValue("shippingRegion", address.region)
      form.setValue("shippingTown", address.town)
      form.setValue("shippingLat", address.latitude ?? null)
      form.setValue("shippingLng", address.longitude ?? null)
    },
    [form]
  )

  useEffect(() => {
    form.setValue("shippingTown", "")
  }, [selectedRegion, form])

  useEffect(() => {
    if (!userId) return

    startTransition(async () => {
      const data = await fetch(`/api/users/${userId}/addresses`)
      const response: DataResponse<Address[]> = await data.json()

      if (response.success && response.data.length > 0) {
        setAddresses(response.data)
        setAddressTab("saved")
        const defaultAddress = response.data.find((a) => a.isDefault) ?? response.data[0]
        if (defaultAddress) handleSelectAddress(defaultAddress)
      } else {
        setAddresses([])
        setSelectedAddressId(null)
        setAddressTab("manual")
      }
    })
  }, [userId, handleSelectAddress])

  const handleSameAsCustomer = () => {
    form.setValue("shippingName", customerName)
    form.setValue("shippingPhone", customerPhone ?? "")
  }

  const handleNext = async () => {
    if (shippingMethod === "pickup") {
      const valid = await form.trigger(["shippingPrice", "taxPrice"])
      if (valid) onNext()
      return
    }

    const valid = await form.trigger(["shippingName", "shippingLine1", "shippingRegion", "shippingTown", "shippingPrice", "taxPrice"])
    if (valid) onNext()
  }

  const clearAddressFields = () => {
    form.setValue("shippingName", "")
    form.setValue("shippingPhone", "")
    form.setValue("shippingLine1", "")
    form.setValue("shippingLine2", "")
    form.setValue("shippingRegion", "")
    form.setValue("shippingTown", "")
    form.setValue("shippingLat", null)
    form.setValue("shippingLng", null)
    setSelectedAddressId(null)
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Shipping Method</CardTitle>
          <CardDescription>How will the customer receive their order?</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <Tabs
            value={shippingMethod}
            onValueChange={(val) => {
              form.setValue("shippingMethod", val as "delivery" | "pickup")
              if (val === "pickup") {
                clearAddressFields()
              } else if (val === "delivery" && userId) {
                // Re-trigger address fetch by resetting
                setAddresses([])
                setAddressTab("manual")
              }
            }}
          >
            <TabsList>
              <TabsTrigger value="delivery">Delivery</TabsTrigger>
              <TabsTrigger value="pickup">Pickup</TabsTrigger>
            </TabsList>

            <TabsContent value="delivery" className="mt-4">
              <Tabs value={addressTab} onValueChange={(val) => setAddressTab(val as "saved" | "manual")}>
                {userId && addresses.length > 0 && (
                  <TabsList>
                    <TabsTrigger value="saved">Saved Addresses</TabsTrigger>
                    <TabsTrigger value="manual">Enter Manually</TabsTrigger>
                  </TabsList>
                )}

                <TabsContent value="saved" className="mt-4">
                  <div className="grid gap-2">
                    {isPending ? (
                      <p className="text-sm text-muted-foreground">Loading addresses...</p>
                    ) : (
                      addresses.map((address) => (
                        <button
                          key={address.id}
                          type="button"
                          onClick={() => handleSelectAddress(address)}
                          className={cn(
                            "flex items-start gap-3 rounded-md border p-4 text-left transition-colors hover:bg-accent",
                            selectedAddressId === address.id && "border-primary bg-accent"
                          )}
                        >
                          <MapPin className={cn("mt-0.5 size-4 shrink-0", selectedAddressId === address.id ? "text-primary" : "text-muted-foreground")} />
                          <div className="grid gap-0.5">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{address.name}</p>
                              {address.isDefault && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Default</span>}
                            </div>
                            <p className="text-xs text-muted-foreground">{address.phone}</p>
                            <p className="text-xs text-muted-foreground">{address.line1}</p>
                            {address.line2 && <p className="text-xs text-muted-foreground">{address.line2}</p>}
                            <p className="text-xs text-muted-foreground">
                              {address.town}, {address.region}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="manual" className="mt-4">
                  {!userId && (
                    <Button type="button" variant="outline" size="sm" className="mb-4 w-fit" onClick={handleSameAsCustomer}>
                      Same as customer
                    </Button>
                  )}
                  <FieldGroup>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <InputField control={form.control} name="shippingName" label="Recipient Name" placeholder="John Doe" />
                      <PhoneField control={form.control} name="shippingPhone" label="Phone" disabled={isPending} defaultCountry="GH" />
                    </div>
                    <InputField control={form.control} name="shippingLine1" label="Address Line 1" placeholder="House number, street name" />
                    <InputField control={form.control} name="shippingLine2" label="Address Line 2 (optional)" placeholder="Apartment, suite, etc." />
                    <div className="grid gap-5 sm:grid-cols-2">
                      <ComboboxField
                        control={form.control}
                        label="Region"
                        name="shippingRegion"
                        disabled={isPending}
                        options={GEODATA.map((data) => ({ label: data.name, value: data.name }))}
                        placeholder="Select a region"
                        searchPlaceholder="Seach regions..."
                        modal
                      />
                      <ComboboxField
                        control={form.control}
                        label="Town"
                        name="shippingTown"
                        disabled={isPending || !selectedRegion}
                        options={towns.map((town) => ({ label: town, value: town }))}
                        placeholder="Select a town"
                        searchPlaceholder="Seach towns.."
                        modal
                      />
                    </div>
                  </FieldGroup>
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="pickup" className="mt-4">
              <div className="flex items-center gap-3 rounded-md border border-dashed p-4">
                <MapPin className="size-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Customer will pick up the order from your store.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
          <CardDescription>Set shipping and tax amounts.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              <NumberField control={form.control} name="shippingPrice" label="Shipping Price" step={0.01} prependText="GH₵" />
              <NumberField control={form.control} name="taxPrice" label="Tax" step={0.01} prependText="GH₵" />
            </div>
            <InputField control={form.control} name="notes" label="Notes (optional)" placeholder="Any special instructions..." />
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 size-4" />
          Back to Customer
        </Button>
        <Button type="button" onClick={handleNext} disabled={shippingMethod === "delivery" && !selectedAddressId && !shippingLine1?.trim()}>
          Review Order
          <ChevronRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  )
}

export default ShippingStep
