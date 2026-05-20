import { prisma } from "@bs42/db"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { Status } from "@bs42/db/enums"

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const search = searchParams.get("q") ?? ""
  const page = Number(searchParams.get("page") ?? 1)
  const organizationId = searchParams.get("organizationId")
  if (!organizationId) return NextResponse.json({ error: "Missing organizationId" }, { status: 400 })
  const pageSize = 20
  const take = pageSize + 1

  try {
    const listings = await prisma.storeListing.findMany({
      where: {
        organizationId,
        status: Status.PUBLISHED,
        product: {
          name: { contains: search, mode: "insensitive" },
        },
      },
      select: {
        id: true,
        product: {
          select: {
            sku: true,
            name: true,
            brand: {
              select: { name: true },
            },
            hasVariants: true,
            images: true,
          },
        },
        sellPrice: true,
        storeListingVariants: {
          select: {
            id: true,
            sellPrice: true,
            variantId: true,
            variant: {
              select: {
                sku: true,
                variantValues: {
                  select: {
                    optionValue: {
                      select: { option: true, value: true },
                    },
                  },
                },
              },
            },
          },
        },
        organization: {
          select: { name: true },
        },
      },
      skip: (page - 1) * pageSize,
      take,
    })

    const hasMore = listings.length > pageSize
    const returnListings = hasMore ? listings.slice(0, pageSize) : listings

    return NextResponse.json({ listings: returnListings, hasMore })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
