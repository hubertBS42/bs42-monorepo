import { Metadata } from "next"
import AddUserForm from "./_components/add-user-form"
import { getStoresForSelect } from "@/lib/data/stores.data"

export const metadata: Metadata = {
  title: "Add User",
}

const AddUserPage = async () => {
  const response = await getStoresForSelect()
  if (!response.success) throw new Error(response.error)
  return <AddUserForm stores={response.data} />
}

export default AddUserPage
