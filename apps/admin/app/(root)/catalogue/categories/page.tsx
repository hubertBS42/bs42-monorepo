import AddButton from "@/components/add-button"
import { getCategoriesForTable } from "@/lib/data/categories.data"
import { Metadata } from "next"
import CategoriesTable from "./_components/categories-table"

export const metadata: Metadata = { title: "Manage Categories" }

const CategoriesPage = async () => {
  const response = await getCategoriesForTable()
  if (!response.success) throw new Error(response.error)

  return (
    <main className="flex flex-col gap-y-6">
      <div className="flex items-end justify-between">
        <div className="grid">
          <h1 className="text-xl font-bold md:text-2xl">Manage Categories</h1>
          <p className="text-sm text-muted-foreground">Manage your product categories.</p>
        </div>

        <AddButton label="Add Category" url="/catalogue/categories/add" />
      </div>
      <CategoriesTable categories={response.data} />
    </main>
  )
}

export default CategoriesPage
