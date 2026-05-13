import { Metadata } from "next"
import AddCategoryForm from "./_components/add-category-form"
import { getCategoriesForSelect } from "@/lib/data/categories.data"

export const metadata: Metadata = {
  title: "Add Category",
}
const AddCategoryPage = async () => {
  const response = await getCategoriesForSelect()
  if (!response.success) throw new Error(response.error)
  return <AddCategoryForm categories={response.data} />
}

export default AddCategoryPage
