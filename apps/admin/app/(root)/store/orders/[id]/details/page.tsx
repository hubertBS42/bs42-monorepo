import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getOrderById } from "@/lib/data/orders.data"
import OrderDetail from "./_components/order-details"

export const metadata: Metadata = { title: "Order" }

type OrderDetailsPageProps = { params: Promise<{ id: string }> }

const OrderDetailsPage = async ({ params }: OrderDetailsPageProps) => {
  const { id } = await params
  const response = await getOrderById(id)

  if (!response.success) {
    if (response.error === "Order not found") notFound()
    throw new Error(response.error)
  }

  return (
    <main className="flex flex-col gap-y-6">
      <OrderDetail order={response.data} />
    </main>
  )
}

export default OrderDetailsPage
