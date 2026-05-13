import { Metadata } from "next"
import EditCategoryForm from "./_components/edit-category-form"
import { getCategoriesForSelect, getCategoryById } from "@/lib/data/categories.data"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Edit Category",
}

type EditCategoryPageProps = {
  params: Promise<{ id: string }>
}

const EditCategoryPage = async ({ params }: EditCategoryPageProps) => {
  const { id } = await params
  const [categoriesResponse, categoryResponse] = await Promise.all([getCategoriesForSelect(), getCategoryById(id)])

  if (!categoryResponse.success) {
    if (categoryResponse.error === "Category not found") notFound()
    throw new Error(categoryResponse.error)
  }

  if (!categoriesResponse.success) throw new Error(categoriesResponse.error)

  return <EditCategoryForm category={categoryResponse.data} categories={categoriesResponse.data} />
}

export default EditCategoryPage
