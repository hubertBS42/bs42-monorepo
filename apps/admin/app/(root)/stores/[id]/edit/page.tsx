import { Metadata } from "next"
import EditStoreForm from "./_components/edit-store-form"
import { getStoreById } from "@/lib/data/stores.data"
import { Suspense } from "react"
import Loader from "@/components/loader"

export const metadata: Metadata = {
  title: "Edit Store",
}

type Props = {
  params: Promise<{ id: string }>
}

const EditStorePage = async ({ params }: Props) => {
  const { id } = await params
  const data = getStoreById(id)
  return (
    <Suspense fallback={<Loader />}>
      <EditStoreForm data={data} />
    </Suspense>
  )
}

export default EditStorePage
