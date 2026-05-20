"use client"

import { UseFormReturn } from "react-hook-form"
import { z } from "zod"
import { createOrderFormSchema } from "@/lib/zod"
import { Button } from "@bs42/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@bs42/ui/components/card"
import { Separator } from "@bs42/ui/components/separator"
import { ChevronLeft, Loader, MapPin } from "lucide-react"
import { formatCurrency } from "@bs42/utils"
import Image from "next/image"

type FormValues = z.infer<typeof createOrderFormSchema>

interface ReviewStepProps {
  form: UseFormReturn<FormValues>
  exchangeRate: number
  isPending: boolean
  onBack: () => void
}

const ReviewStep = ({ form, exchangeRate, isPending, onBack }: ReviewStepProps) => {
  const values = form.watch()
  const discountType = values.discountType
  const discountValue = values.discountValue ?? 0

  const subtotalUsd = values.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const subtotalGhs = subtotalUsd * exchangeRate

  const discountAmount = (() => {
    if (!discountType || !discountValue) return 0
    if (discountType === "FIXED") return discountValue
    return (subtotalGhs * discountValue) / 100
  })()

  const total = subtotalGhs + values.shippingPrice + values.taxPrice - discountAmount

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left - Items and totals */}
        <div className="grid auto-rows-max gap-4 lg:col-span-2">
          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>Review the products, quantities, and prices in your order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {values.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded bg-muted">
                      {item.productImage && <Image src={item.productImage} alt={item.productName} fill sizes="48px" className="object-cover" />}
                    </div>
                    <div className="grid flex-1 gap-0.5">
                      <p className="text-sm font-medium">{item.productName}</p>
                      {item.variantDescription && <p className="text-xs text-muted-foreground">{item.variantDescription}</p>}
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">
                      {formatCurrency(item.unitPrice * item.quantity * exchangeRate, "GHS", "en-GH", {
                        currencyDisplay: "symbol",
                      })}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(subtotalGhs, "GHS", "en-GH", { currencyDisplay: "symbol" })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatCurrency(values.shippingPrice, "GHS", "en-GH", { currencyDisplay: "symbol" })}</span>
                </div>
                {values.taxPrice > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatCurrency(values.taxPrice, "GHS", "en-GH", { currencyDisplay: "symbol" })}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-destructive">
                    <span>
                      Discount
                      {discountType === "PERCENTAGE" && ` (${discountValue}%)`}
                      {values.discountReason && ` · ${values.discountReason}`}
                    </span>
                    <span>-{formatCurrency(discountAmount, "GHS", "en-GH", { currencyDisplay: "symbol" })}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(total, "GHS", "en-GH", { currencyDisplay: "symbol" })}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right - Customer and shipping */}
        <div className="grid auto-rows-max gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
              <CardDescription>Basic customer information</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-1 text-sm">
              <p className="font-medium">{values.customerName}</p>
              <p className="text-muted-foreground">{values.customerEmail}</p>
              {values.customerPhone && <p className="text-muted-foreground">{values.customerPhone}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping</CardTitle>
              <CardDescription>Shipping method and address recipient</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-1 text-sm">
              {values.shippingMethod === "pickup" ? (
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-muted-foreground" />
                  <span>Customer pickup</span>
                </div>
              ) : (
                <>
                  <p className="font-medium">{values.shippingName}</p>
                  {values.shippingPhone && <p className="text-muted-foreground">{values.shippingPhone}</p>}
                  <p className="text-muted-foreground">{values.shippingLine1}</p>
                  {values.shippingLine2 && <p className="text-muted-foreground">{values.shippingLine2}</p>}
                  <p className="text-muted-foreground">
                    {values.shippingTown}, {values.shippingRegion}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
              <CardDescription>Payment method and status</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span>Cash</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span>Pending</span>
              </div>
            </CardContent>
          </Card>

          {values.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
                <CardDescription>Additional instructions or comments for this order</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{values.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={isPending}>
          <ChevronLeft className="mr-2 size-4" />
          Back to Shipping
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader className="mr-2 size-4 animate-spin" />
              Creating Order...
            </>
          ) : (
            "Place Order"
          )}
        </Button>
      </div>
    </div>
  )
}

export default ReviewStep
