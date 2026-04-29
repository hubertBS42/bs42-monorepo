import { APP_NAME } from "@/constants"
import { Building2 } from "lucide-react"
import SignOutButton from "@/components/sign-out-button"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "No Stores Found",
}

const NoStoresPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="grid w-full max-w-md gap-6 p-6 text-center">
        <div className="flex justify-center">
          <Building2 className="size-16 text-muted-foreground" />
        </div>
        <div className="grid gap-2">
          <h1 className="text-2xl font-bold">No Stores Found</h1>
          <p className="text-sm text-muted-foreground">
            You are not a member of any store on {APP_NAME}. Please contact your
            administrator to be added to a store.
          </p>
        </div>
        <SignOutButton />
      </div>
    </div>
  )
}

export default NoStoresPage
