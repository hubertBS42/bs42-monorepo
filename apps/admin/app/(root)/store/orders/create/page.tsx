import { getCurrentRate } from "@/lib/data/exchange-rates.data"
import { getListingsForOrder } from "@/lib/data/listings.data"
import { Metadata } from "next"
import CreateOrderForm from "./_components/create-order-form"

export const metadata: Metadata = { title: "Create a new order" }

const CreateOrderPage = async () => {
  const [listingsResponse, exchangeRateResponse] = await Promise.all([getListingsForOrder(), getCurrentRate()])

  if (!listingsResponse.success) throw new Error(listingsResponse.error)
  if (!exchangeRateResponse.success) throw new Error(exchangeRateResponse.error)
  return (
    <main className="flex flex-col gap-y-6">
      <div className="grid">
        <h1 className="text-xl font-bold md:text-2xl">Create Order</h1>
        <p className="text-sm text-muted-foreground">Create a new order for a customer.</p>
      </div>
      <CreateOrderForm listings={listingsResponse.data} exchangeRate={exchangeRateResponse.data} />
    </main>
  )
}

export default CreateOrderPage
