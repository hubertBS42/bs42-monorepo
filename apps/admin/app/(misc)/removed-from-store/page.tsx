import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import RemovedFromStore from "./_components/removed-from-store"
import { prisma } from "@bs42/db"
import SuccessToast from "@bs42/ui/components/success-toast"
import { Metadata } from "next"

interface RemovedFromStorePage {
  searchParams: Promise<{ success?: string }>
}

export const metadata: Metadata = {
  title: "Removed From Store",
}

const RemovedFromStorePage = async ({ searchParams }: RemovedFromStorePage) => {
  const { success } = await searchParams
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/sign-in")

  // Get remaining memberships
  const memberships = await prisma.member.findMany({
    where: { userId: session.user.id },
    include: { organization: true },
  })

  return (
    <>
      {success && <SuccessToast message={decodeURIComponent(success)} />}
      <RemovedFromStore memberships={memberships} />
    </>
  )
}

export default RemovedFromStorePage
