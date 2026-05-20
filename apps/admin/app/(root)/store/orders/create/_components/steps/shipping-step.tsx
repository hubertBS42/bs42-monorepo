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
import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import { Address } from "@bs42/db/client"
import { DataResponse } from "@bs42/types"
import { cn } from "@bs42/ui/lib/utils"
import PhoneField from "@bs42/ui/components/phone-field"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@bs42/ui/components/tabs"
import ComboboxField from "@bs42/ui/components/combobox-field"
import { GEODATA } from "@bs42/ui/constants"
import { formatCurrency } from "@bs42/utils"
import SwitchCardField from "@bs42/ui/components/switch-card-field"
import SelectField from "@bs42/ui/components/select-field"

type FormValues = z.infer<typeof createOrderFormSchema>

interface ShippingStepProps {
  form: UseFormReturn<FormValues>
  onBack: () => void
  onNext: () => void
  exchangeRate: number
}

const ShippingStep = ({ form, onBack, onNext, exchangeRate }: ShippingStepProps) => {
  const [isPending, startTransition] = useTransition()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [addressTab, setAddressTab] = useState<"saved" | "manual">("manual")
  const [fetchTrigger, setFetchTrigger] = useState(0)

  const isAddressSelectedRef = useRef(false)

  const userId = form.watch("userId")
  const customerName = form.watch("customerName")
  const customerPhone = form.watch("customerPhone")
  const shippingMethod = form.watch("shippingMethod")
  const shippingLine1 = form.watch("shippingLine1")
  const selectedRegion = form.watch("shippingRegion")
  const applyDiscount = form.watch("applyDiscount")
  const discountType = form.watch("discountType")
  const discountValue = form.watch("discountValue")
  const items = form.watch("items")

  const subtotalUsd = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const subtotalGhs = subtotalUsd * exchangeRate

  const discountAmount = (() => {
    if (!discountType || !discountValue) return 0
    if (discountType === "FIXED") return discountValue
    return (subtotalGhs * discountValue) / 100
  })()

  const towns = GEODATA.find((region) => region.name === selectedRegion)?.towns ?? []

  const handleSelectAddress = useCallback(
    (address: Address) => {
      isAddressSelectedRef.current = true
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
    if (isAddressSelectedRef.current) {
      isAddressSelectedRef.current = false
      return
    }
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
  }, [userId, handleSelectAddress, fetchTrigger])

  const handleSameAsCustomer = () => {
    form.setValue("shippingName", customerName)
    form.setValue("shippingPhone", customerPhone ?? "")
  }

  const handleNext = async () => {
    const fieldsToValidate: (keyof FormValues)[] = ["shippingPrice", "taxPrice"]

    if (shippingMethod === "delivery") {
      fieldsToValidate.push("shippingName", "shippingLine1", "shippingRegion", "shippingTown")
    }

    if (applyDiscount) {
      fieldsToValidate.push("discountValue")
    }

    const valid = await form.trigger(fieldsToValidate)
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
                setAddresses([])
                setAddressTab("manual")
                setFetchTrigger((prev) => prev + 1)
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
                        onChange={() => form.clearErrors("shippingRegion")}
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
                        onChange={() => form.clearErrors("shippingTown")}
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
          <CardDescription>Set shipping, tax and discount amounts.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              <NumberField control={form.control} name="shippingPrice" label="Shipping Price" step={0.01} prependText="GH₵" />
              <NumberField control={form.control} name="taxPrice" label="Tax" step={0.01} prependText="GH₵" />
            </div>

            <SwitchCardField
              control={form.control}
              label="Apply Discount"
              name="applyDiscount"
              description="Apply a percentage or fixed discount to this order."
              onChange={(checked) => {
                if (!checked) {
                  form.setValue("discountType", null)
                  form.setValue("discountValue", null)
                  form.setValue("discountReason", "")
                  form.clearErrors("discountValue")
                } else {
                  form.setValue("discountType", "PERCENTAGE")
                  form.setValue("discountValue", 0)
                }
              }}
            />

            {applyDiscount && (
              <div className="rounded-md border p-4">
                <FieldGroup>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <SelectField
                      control={form.control}
                      name="discountType"
                      label="Discount Type"
                      loadingPlaceholder="Percentage"
                      options={[
                        { label: "Percentage", value: "PERCENTAGE" },
                        { label: "Fixed Amount", value: "FIXED" },
                      ]}
                      onChange={() => form.setValue("discountValue", null)}
                    />
                    <NumberField
                      control={form.control}
                      name="discountValue"
                      label={discountType === "PERCENTAGE" ? "Percentage (%)" : "Amount (GH₵)"}
                      step={discountType === "PERCENTAGE" ? 1 : 0.01}
                      prependText={discountType === "PERCENTAGE" ? "%" : "GH₵"}
                      max={discountType === "PERCENTAGE" ? 100 : undefined}
                      onValueChange={() => form.clearErrors("discountValue")}
                    />
                  </div>
                  {discountAmount > 0 && (
                    <p className="text-sm text-muted-foreground">Discount amount: -{formatCurrency(discountAmount, "GHS", "en-GH", { currencyDisplay: "symbol" })}</p>
                  )}
                  <InputField control={form.control} name="discountReason" label="Reason (optional)" placeholder="e.g. Loyal customer, bulk order..." />
                </FieldGroup>
              </div>
            )}

            <InputField control={form.control} name="notes" label="Notes (optional)" placeholder="Any special instructions..." />
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Discount */}
      {/* {applyDiscount && (
        <Card>
          <CardHeader>
            <CardTitle>Discount</CardTitle>
            <CardDescription>Apply discount to this order.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid gap-5 sm:grid-cols-2">
                <SelectField
                  control={form.control}
                  name="discountType"
                  label="Type"
                  loadingPlaceholder="Percentage"
                  options={["PERCENTAGE", "FIXED"].map((o) => ({ label: capitalizeFirstLetter(o), value: o }))}
                  onChange={() => {
                    form.setValue("discountValue", 0)
                  }}
                />
                <NumberField
                  control={form.control}
                  name="discountValue"
                  label="Value"
                  step={discountType === "PERCENTAGE" ? 1 : 0.01}
                  prependText={discountType === "PERCENTAGE" ? "%" : "GH₵"}
                  max={discountType === "PERCENTAGE" ? 100 : undefined}
                />
              </div>
              {discountAmount > 0 && <p className="text-xs text-muted-foreground">Discount: -{formatCurrency(discountAmount, "GHS", "en-GH", { currencyDisplay: "symbol" })}</p>}
              <InputField
                control={form.control}
                name="discountReason"
                label="Discount Reason (optional)"
                placeholder="e.g. Loyal customer, bulk order..."
                disabled={!discountType}
              />
            </FieldGroup>
          </CardContent>
        </Card>
      )} */}

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
