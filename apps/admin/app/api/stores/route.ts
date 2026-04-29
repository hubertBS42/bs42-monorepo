import { NextResponse, type NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { formatError } from "@bs42/auth/server"
import { prisma } from "@bs42/db"
import { Store } from "@/types"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { role } = session.user
    const isPlatformStaff = role === "superAdmin" || role === "admin"

    const stores: Store[] = await prisma.organization.findMany({
      where: isPlatformStaff
        ? undefined
        : {
            members: { some: { userId: session.user.id } },
          },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(stores)
  } catch (error) {
    return NextResponse.json({ error: formatError(error) }, { status: 500 })
  }
}
