import { getCurrentRate } from "@/lib/data/exchange-rates.data"
import { Metadata } from "next"
import CreateOrderForm from "./_components/create-order-form"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export const metadata: Metadata = { title: "Create a new order" }

const CreateOrderPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/sign-in")

  const activeStoreId = session.session.activeOrganizationId
  if (!activeStoreId) redirect("/")

  const exchangeRateResponse = await getCurrentRate()
  if (!exchangeRateResponse.success) throw new Error(exchangeRateResponse.error)
  return (
    <main className="flex flex-col gap-y-6">
      <div className="grid">
        <h1 className="text-xl font-bold md:text-2xl">Create Order</h1>
        <p className="text-sm text-muted-foreground">Create a new order for a customer.</p>
      </div>
      <CreateOrderForm organizationId={activeStoreId} exchangeRate={exchangeRateResponse.data} />
    </main>
  )
}

export default CreateOrderPage
