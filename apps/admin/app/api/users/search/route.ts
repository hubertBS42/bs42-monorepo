import { NextResponse, type NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { formatError } from "@bs42/auth/server"
import { prisma } from "@bs42/db"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Get the search query from URL params
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q") || searchParams.get("query")

    // Validate query parameter
    if (!query || query.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Search query is required" }, { status: 400 })
    }

    // Search users
    const users = await prisma.user.findMany({
      where: {
        OR: [{ name: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }, { phone: { contains: query, mode: "insensitive" } }],
      },
      select: { id: true, name: true, email: true, phone: true },
      take: 5,
    })

    return NextResponse.json({ success: true, data: users })
  } catch (error) {
    return NextResponse.json({ success: false, error: formatError(error) }, { status: 500 })
  }
}
