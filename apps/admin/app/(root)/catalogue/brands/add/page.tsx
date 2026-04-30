import { Metadata } from "next"
import AddBrandForm from "./_components/add-brand-form"

export const metadata: Metadata = {
  title: "Add Brand",
}
const AddBrandPage = () => {
  return <AddBrandForm />
}

export default AddBrandPage
