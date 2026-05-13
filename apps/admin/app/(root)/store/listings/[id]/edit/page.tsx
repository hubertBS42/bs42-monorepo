import { Metadata } from "next"
import EditListingForm from "./_components/edit-listing-form"
import { getStoreListingById } from "@/lib/data/listings.data"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Edit Listing",
}

type EditListingPageProps = {
  params: Promise<{ id: string }>
}
const EditListingPage = async ({ params }: EditListingPageProps) => {
  const { id } = await params

  const response = await getStoreListingById(id)

  if (!response.success) {
    if (response.error === "Listing not found") notFound()
    throw new Error(response.error)
  }

  return <EditListingForm listing={response.data} />
}

export default EditListingPage
