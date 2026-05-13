import { Metadata } from "next"
import AddProductForm from "./_components/add-product-form"
import { getCategoriesForSelect } from "@/lib/data/categories.data"
import { getBrandsForSelect } from "@/lib/data/brands.data"

export const metadata: Metadata = {
  title: "Add Product",
}
const AddProductPage = async () => {
  const [categoriesResponse, brandsResponse] = await Promise.all([getCategoriesForSelect(), getBrandsForSelect()])
  if (!categoriesResponse.success) throw new Error(categoriesResponse.error)
  if (!brandsResponse.success) throw new Error(brandsResponse.error)
  return <AddProductForm categories={categoriesResponse.data} brands={brandsResponse.data} />
}

export default AddProductPage
