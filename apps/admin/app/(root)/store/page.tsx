import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@bs42/ui/components/card"
import { Badge } from "@bs42/ui/components/badge"
import { capitalizeFirstLetter } from "@bs42/utils"
import { format } from "date-fns"
import { prisma } from "@bs42/db"
import StoreActions from "./_components/store-actions"

const StoreOverviewPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/sign-in")

  const activeStoreId = session.session.activeOrganizationId
  if (!activeStoreId) redirect("/")

  const store = await prisma.organization.findUnique({
    where: { id: activeStoreId },
  })

  if (!store) notFound()

  const isPlatformStaff =
    session.user.role === "superAdmin" || session.user.role === "admin"

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Store Details</CardTitle>
          <CardDescription>
            General information about this store
          </CardDescription>
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
              <p className="text-xs text-muted-foreground">Plan</p>
              <div>
                <Badge variant="secondary">
                  {capitalizeFirstLetter(store.plan ?? "N/A")}
                </Badge>
              </div>
            </div>
            <div className="grid gap-1">
              <p className="text-xs text-muted-foreground">Status</p>
              <div>
                <Badge
                  variant={
                    store.status === "ACTIVE"
                      ? "default"
                      : store.status === "SUSPENDED"
                        ? "destructive"
                        : "outline"
                  }
                >
                  {capitalizeFirstLetter(store.status?.toLowerCase() ?? "N/A")}
                </Badge>
              </div>
            </div>
            <div className="grid gap-1">
              <p className="text-xs text-muted-foreground">Created on</p>
              <p className="text-sm font-medium">
                {format(new Date(store.createdAt), "LLL dd, y")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <StoreActions store={store} isPlatformStaff={isPlatformStaff} />
    </div>
  )
}

export default StoreOverviewPage
