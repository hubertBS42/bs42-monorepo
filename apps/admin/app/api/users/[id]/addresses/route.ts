import { formatError } from "@bs42/auth/server"
import { prisma } from "@bs42/db"
import { NextRequest, NextResponse } from "next/server"
import { isUUID } from "validator"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id || !isUUID(id)) {
      return NextResponse.json({ success: false, error: "Invalid user ID" }, { status: 400 })
    }

    const addresses = await prisma.address.findMany({
      where: { userId: id },
      orderBy: { isDefault: "desc" },
    })

    return NextResponse.json({ success: true, data: addresses })
  } catch (error) {
    return NextResponse.json({ success: false, error: formatError(error) }, { status: 500 })
  }
}
