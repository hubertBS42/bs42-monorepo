import { Metadata } from "next"
import EditProductForm from "./_components/edit-product-form"
import { getCategoriesForSelect } from "@/lib/data/categories.data"
import { getBrandsForSelect } from "@/lib/data/brands.data"
import { getProductById } from "@/lib/data/products.data"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Edit Product",
}

type EditProductPageProps = {
  params: Promise<{ id: string }>
}
const EditProductPage = async ({ params }: EditProductPageProps) => {
  const { id } = await params
  const [productResponse, categoriesResponse, brandsResponse] = await Promise.all([getProductById(id), getCategoriesForSelect(), getBrandsForSelect()])

  if (!productResponse.success) {
    if (productResponse.error === "Product not found") notFound()
    throw new Error(productResponse.error)
  }

  if (!categoriesResponse.success) throw new Error(categoriesResponse.error)
  if (!brandsResponse.success) throw new Error(brandsResponse.error)
  return <EditProductForm product={productResponse.data} categories={categoriesResponse.data} brands={brandsResponse.data} />
}

export default EditProductPage
