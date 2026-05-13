import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@bs42/ui/components/card"
import { Badge } from "@bs42/ui/components/badge"
import { capitalizeFirstLetter } from "@bs42/utils"
import { format } from "date-fns"
import { prisma } from "@bs42/db"
import StoreActions from "./_components/store-actions"
import { Metadata } from "next"
import { Button } from "@bs42/ui/components/button"
import Link from "next/link"
import { ArrowRightIcon, Mail, ShoppingBag, Users } from "lucide-react"

export const metadata: Metadata = {
  title: "Store Overview",
}

const storeLinks = [
  {
    href: "/store/listings",
    icon: ShoppingBag,
    title: "Listings",
    description: "View and manage this store's listings",
  },
  {
    href: "/store/members",
    icon: Users,
    title: "Members",
    description: "View and manage this store's members",
  },
  {
    href: "/store/invitations",
    icon: Mail,
    title: "Invitations",
    description: "View and manage this store's invitations",
  },
]

const StoreOverviewPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/sign-in")

  const activeStoreId = session.session.activeOrganizationId
  if (!activeStoreId) redirect("/")

  const store = await prisma.organization.findUnique({
    where: { id: activeStoreId },
  })

  if (!store) notFound()

  const isPlatformStaff = session.user.role === "superAdmin" || session.user.role === "admin"

  return (
    <main className="flex flex-col gap-y-6">
      <div className="grid">
        <h1 className="text-xl font-bold md:text-2xl">Store Overview</h1>
        <p className="text-sm text-muted-foreground">An overview of your store.</p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Store Details</CardTitle>
            <CardDescription>General information about this store</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-sm font-medium">{store.name}</p>
              </div>
              <div className="grid gap-1">
                <p className="text-xs text-muted-foreground">Slug</p>
                <p className="font-mono text-sm font-medium">{store.slug}</p>
              </div>
              <div className="grid gap-1">
                <p className="text-xs text-muted-foreground">Status</p>
                <div>
                  <Badge variant={store.status === "ACTIVE" ? "success" : store.status === "SUSPENDED" ? "destructive" : "outline"}>
                    {capitalizeFirstLetter(store.status?.toLowerCase() ?? "N/A")}
                  </Badge>
                </div>
              </div>
              <div className="grid gap-1">
                <p className="text-xs text-muted-foreground">Created on</p>
                <p className="text-sm font-medium">{format(new Date(store.createdAt), "LLL dd, y")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 @xl/main:grid-cols-3">
          {storeLinks.map((link) => {
            const Icon = link.icon
            return (
              <Card key={link.href} className="transition-colors hover:bg-accent/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="size-5 text-primary" />
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={link.href}>
                        <ArrowRightIcon className="size-4" />
                      </Link>
                    </Button>
                  </div>
                  <CardTitle className="text-base">{link.title}</CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>

        <StoreActions store={store} isPlatformStaff={isPlatformStaff} />
      </div>
    </main>
  )
}

export default StoreOverviewPage
