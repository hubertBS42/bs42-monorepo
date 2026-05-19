"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@bs42/ui/components/sonner"
import { Button } from "@bs42/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@bs42/ui/components/card"
import { Textarea } from "@bs42/ui/components/textarea"
import { Label } from "@bs42/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@bs42/ui/components/select"
import { updateOrderStatusAction } from "@/lib/actions/order.actions"
import { OrderDetails } from "@/types"
import { OrderStatus } from "@bs42/db/enums"
import { capitalizeFirstLetter } from "@bs42/utils"

const getStatusTransitions = (order: OrderDetails): Record<OrderStatus, OrderStatus[]> => ({
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: order.shippingMethod === "PICKUP" ? ["COMPLETED", "CANCELLED"] : ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: ["COMPLETED", "REFUNDED"],
  COMPLETED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
})

const UpdateOrderStatus = ({ order }: { order: OrderDetails }) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("")
  const [note, setNote] = useState("")

  const availableStatuses = getStatusTransitions(order)[order.status] ?? []

  if (availableStatuses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Update Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No further status updates available for this order.</p>
        </CardContent>
      </Card>
    )
  }

  const handleUpdate = () => {
    if (!selectedStatus) return

    startTransition(async () => {
      const response = await updateOrderStatusAction(order.id, selectedStatus, note.trim() || undefined)

      if (!response.success) {
        toast.error("Failed to update status", { description: response.error })
      } else {
        toast.success("Order status updated.")
        setSelectedStatus("")
        setNote("")
        router.refresh()
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Status</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-1.5">
          <Label>New Status</Label>
          <Select value={selectedStatus} onValueChange={(val) => setSelectedStatus(val as OrderStatus)} disabled={isPending}>
            <SelectTrigger>
              <SelectValue placeholder="Select status..." />
            </SelectTrigger>
            <SelectContent>
              {availableStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {capitalizeFirstLetter(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label>Note (optional)</Label>
          <Textarea placeholder="Add a note about this status change..." value={note} onChange={(e) => setNote(e.target.value)} disabled={isPending} rows={3} />
        </div>

        <Button onClick={handleUpdate} disabled={!selectedStatus || isPending} className="w-full">
          {isPending ? "Updating..." : "Update Status"}
        </Button>
      </CardContent>
    </Card>
  )
}

export default UpdateOrderStatus
