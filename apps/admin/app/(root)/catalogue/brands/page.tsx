import AddButton from "@/components/add-button"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Manage Brands" }

const BrandsPage = async () => {
  return (
    <main className="flex flex-col gap-y-6">
      <div className="flex items-end justify-between">
        <div className="grid">
          <h1 className="text-xl font-bold md:text-2xl">Manage Brands</h1>
          <p className="text-sm text-muted-foreground">
            Manage your store&apos;s product brands.
          </p>
        </div>

        <AddButton label="Add Brand" url="/catalogue/brands/add" />
      </div>
    </main>
  )
}

export default BrandsPage
