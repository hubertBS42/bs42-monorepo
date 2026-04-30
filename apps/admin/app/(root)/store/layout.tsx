import { Metadata } from "next"
import Header from "./_components/header"
import { ReactNode } from "react"

export const metadata: Metadata = {
  description: "Mangage this store's members and invitations",
}

const StoreLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="flex flex-col gap-y-6">
      <Header />
      {children}
    </main>
  )
}

export default StoreLayout
