import { getUserById } from "@/lib/data/users.data"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import EditStoreUserForm from "./_components/edit-store-user-form"
import EditAdminForm from "./_components/edit-admin-form"
import { getStoresForSelect } from "@/lib/data/stores.data"

export const metadata: Metadata = {
  title: "Edit User",
}

interface EditUserPageProps {
  params: Promise<{ id: string }>
}

const EditUserPage = async ({ params }: EditUserPageProps) => {
  const { id } = await params
  const response = await getUserById(id)
  if (!response.success) {
    if (response.error === "User not found") notFound()
    throw new Error(response.error)
  }

  const user = response.data

  if (user.role === "user") {
    const response = await getStoresForSelect()
    if (!response.success) throw new Error(response.error)
    const stores = response.data

    return <EditStoreUserForm user={user} stores={stores} />
  }

  return <EditAdminForm user={user} />
}
export default EditUserPage
