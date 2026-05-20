"use client"

import { OrderDetails } from "@/types"
import { format } from "date-fns"
import { Badge } from "@bs42/ui/components/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@bs42/ui/components/card"
import { Separator } from "@bs42/ui/components/separator"
import { capitalizeFirstLetter, formatCurrency } from "@bs42/utils"
import Image from "next/image"
import UpdateOrderStatus from "./update-order-status"
import { OrderStatus } from "@bs42/db/enums"
import { MapPin } from "lucide-react"
import OrderTimeline from "./order-timeline"

const STATUS_VARIANTS: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  CONFIRMED: "default",
  PROCESSING: "default",
  SHIPPED: "default",
  DELIVERED: "default",
  COMPLETED: "default",
  CANCELLED: "destructive",
  REFUNDED: "destructive",
}

// Group order items by store
const groupByStore = (items: OrderDetails["orderItems"]) => {
  return items.reduce(
    (acc, item) => {
      const storeName = item.storeName
      if (!acc[storeName]) acc[storeName] = []
      acc[storeName].push(item)
      return acc
    },
    {} as Record<string, OrderDetails["orderItems"]>
  )
}

interface OrderDetailsProps {
  order: OrderDetails
}

const OrderDetail = ({ order }: OrderDetailsProps) => {
  const groupedItems = groupByStore(order.orderItems)

  return (
    <div className="grid gap-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="grid gap-y-1">
          <h1 className="text-xl font-bold md:text-2xl">Order {order.reference}</h1>
          <p className="text-sm text-muted-foreground">
            Placed {format(order.createdAt, "MMM d, yyyy, h:mm a")}
            {order.createdBy && ` · Created by ${order.createdBy.name}`}
          </p>
        </div>
        <Badge variant={STATUS_VARIANTS[order.status]}>{capitalizeFirstLetter(order.status)}</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left column */}
        <div className="grid auto-rows-max gap-y-4 lg:col-span-2">
          {/* Items grouped by store */}
          {Object.entries(groupedItems).map(([storeName, items]) => (
            <Card key={storeName}>
              <CardHeader>
                <CardTitle className="text-base">{storeName}</CardTitle>
                <CardDescription>
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                        {item.productImage && <Image src={item.productImage} alt={item.productName} fill sizes="56px" className="object-cover" />}
                      </div>
                      <div className="grid flex-1 gap-0.5">
                        <p className="font-medium">{item.productName}</p>
                        {item.variantDescription && <p className="text-xs text-muted-foreground">{item.variantDescription}</p>}
                        {item.sku && <p className="font-mono text-xs text-muted-foreground">SKU: {item.sku}</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(Number(item.unitPrice) * Number(order.exchangeRate), "GHS", "en-GH", {
                            currencyDisplay: "symbol",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">× {item.quantity}</p>
                        <p className="text-sm font-semibold">
                          {formatCurrency(Number(item.totalPrice) * Number(order.exchangeRate), "GHS", "en-GH", {
                            currencyDisplay: "symbol",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          {/* <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple">
                {Object.entries(groupedItems).map(([storeName, items]) => (
                  <AccordionItem key={storeName} value={storeName}>
                    <AccordionTrigger>{storeName}</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-4">
                        {items.map((item) => (
                          <div key={item.id} className="flex items-center gap-4">
                            <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                              {item.productImage && <Image src={item.productImage} alt={item.productName} fill sizes="56px" className="object-cover" />}
                            </div>
                            <div className="grid flex-1 gap-0.5">
                              <p className="font-medium">{item.productName}</p>
                              {item.variantDescription && <p className="text-xs text-muted-foreground">{item.variantDescription}</p>}
                              {item.sku && <p className="font-mono text-xs text-muted-foreground">SKU: {item.sku}</p>}
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {formatCurrency(Number(item.unitPrice) * Number(order.exchangeRate), "GHS", "en-GH", {
                                  currencyDisplay: "symbol",
                                })}
                              </p>
                              <p className="text-xs text-muted-foreground">× {item.quantity}</p>
                              <p className="text-sm font-semibold">
                                {formatCurrency(Number(item.totalPrice) * Number(order.exchangeRate), "GHS", "en-GH", {
                                  currencyDisplay: "symbol",
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card> */}

          {/* Order progress */}
          <Card>
            <CardHeader>
              <CardTitle>Order Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline currentStatus={order.status} statusHistory={order.statusHistory} />
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="grid auto-rows-max gap-y-4">
          {/* Update Status */}
          <UpdateOrderStatus order={order} />

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>
                    {formatCurrency(Number(order.subtotalGhs), "GHS", "en-GH", {
                      currencyDisplay: "symbol",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {formatCurrency(Number(order.shippingPrice), "GHS", "en-GH", {
                      currencyDisplay: "symbol",
                    })}
                  </span>
                </div>
                {Number(order.taxPrice) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>
                      {formatCurrency(Number(order.taxPrice), "GHS", "en-GH", {
                        currencyDisplay: "symbol",
                      })}
                    </span>
                  </div>
                )}
                {order.discountAmount && Number(order.discountAmount) > 0 && (
                  <div className="flex justify-between text-destructive">
                    <span>
                      Discount
                      {order.discountType === "PERCENTAGE" && ` (${order.discountValue}%)`}
                      {order.discountReason && ` · ${order.discountReason}`}
                    </span>
                    <span>
                      -
                      {formatCurrency(Number(order.discountAmount), "GHS", "en-GH", {
                        currencyDisplay: "symbol",
                      })}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>
                    {formatCurrency(Number(order.totalPrice), "GHS", "en-GH", {
                      currencyDisplay: "symbol",
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Payment</span>
                  <span>{capitalizeFirstLetter(order.paymentMethod)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Payment Status</span>
                  <Badge variant={order.paymentStatus === "PAID" ? "default" : "secondary"} className="text-xs">
                    {capitalizeFirstLetter(order.paymentStatus)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-1 text-sm">
              <p className="font-medium">{order.customerName}</p>
              <p className="text-muted-foreground">{order.customerEmail}</p>
              {order.customerPhone && <p className="text-muted-foreground">{order.customerPhone}</p>}
            </CardContent>
          </Card>

          {/* Shipping */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-1 text-sm">
              {order.shippingMethod === "PICKUP" ? (
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-muted-foreground" />
                  <span>Customer pickup</span>
                </div>
              ) : (
                <>
                  <p className="font-medium">{order.shippingName}</p>
                  {order.shippingPhone && <p className="text-muted-foreground">{order.shippingPhone}</p>}
                  <p className="text-muted-foreground">{order.shippingLine1}</p>
                  {order.shippingLine2 && <p className="text-muted-foreground">{order.shippingLine2}</p>}
                  <p className="text-muted-foreground">
                    {order.shippingTown}, {order.shippingRegion}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderDetail
