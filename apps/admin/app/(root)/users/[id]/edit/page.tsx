import { getUserById } from "@/lib/data/users.data"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import EditStoreUserForm from "./_components/edit-store-user-form"
import EditAdminForm from "./_components/edit-admin-form"

export const metadata: Metadata = {
  title: "Edit User",
}

interface EditUserPageProps {
  params: Promise<{ id: string }>
}

const EditUserPage = async ({ params }: EditUserPageProps) => {
  const { id } = await params
  const response = await getUserById(id)
  if (!response.success) throw new Error(response.error)
  if (!response.data) notFound()

  const user = response.data

  if (user.role === "user") return <EditStoreUserForm user={user} />
  return <EditAdminForm user={user} />
}
export default EditUserPage
