import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import RemovedFromStore from "./_components/removed-from-store"
import { prisma } from "@bs42/db"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Removed From Store",
}

const RemovedFromStorePage = async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/sign-in")

  // Get remaining memberships
  const memberships = await prisma.member.findMany({
    where: { userId: session.user.id },
    include: { organization: true },
  })

  return <RemovedFromStore memberships={memberships} />
}

export default RemovedFromStorePage
