import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@bs42/ui/components/card"
import { Button } from "@bs42/ui/components/button"
import { ShoppingBag, Tag, Building2, ArrowRightIcon } from "lucide-react"
import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Catalogue Overview" }

const catalogueLinks = [
  {
    href: "/catalogue/products",
    icon: ShoppingBag,
    title: "Products",
    description: "Manage your product listings, prices and inventory",
  },
  {
    href: "/catalogue/categories",
    icon: Tag,
    title: "Categories",
    description: "Organise products into categories",
  },
  {
    href: "/catalogue/brands",
    icon: Building2,
    title: "Brands",
    description: "Manage the brands associated with your products",
  },
]

const CataloguePage = async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/sign-in")

  return (
    <main className="flex flex-col gap-y-6">
      <div className="flex items-end justify-between">
        <div className="grid">
          <h1 className="text-xl font-bold md:text-2xl">Catelogue</h1>
          <p className="text-sm text-muted-foreground">
            Manage your store&apos;s products, categories and brands.
          </p>
        </div>

        {/* <AddButton label="Add User" url="/users/add" /> */}
      </div>

      <div className="grid gap-4 @xl/main:grid-cols-3">
        {catalogueLinks.map((link) => {
          const Icon = link.icon
          return (
            <Card
              key={link.href}
              className="transition-colors hover:bg-accent/50"
            >
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
    </main>
  )
}

export default CataloguePage
