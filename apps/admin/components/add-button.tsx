import Link from "next/link"
import { buttonVariants } from "@bs42/ui/components/button"
import { Plus } from "lucide-react"

const AddButton = ({ label, url }: { label: string; url: string }) => {
  return (
    <Link
      className={buttonVariants({ variant: "default", size: "sm" })}
      href={url}
    >
      <Plus />
      <span className="hidden md:block">{label}</span>
    </Link>
  )
}
export default AddButton
