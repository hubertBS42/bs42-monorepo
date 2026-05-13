import { Metadata } from "next"
import EditBrandForm from "./_components/edit-brand-form"
import { getBrandById } from "@/lib/data/brands.data"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Edit Brand",
}

type Props = {
  params: Promise<{ id: string }>
}
const EditBrandPage = async ({ params }: Props) => {
  const { id } = await params
  const response = await getBrandById(id)

  if (!response.success) {
    if (response.error === "Brand not found") notFound()
    throw new Error(response.error)
  }
  return <EditBrandForm brand={response.data} />
}

export default EditBrandPage
