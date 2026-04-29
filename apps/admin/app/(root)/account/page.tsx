import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@bs42/ui/components/avatar"
import { Badge } from "@bs42/ui/components/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@bs42/ui/components/card"
import { Button } from "@bs42/ui/components/button"
import { abbreviateName, capitalizeFirstLetter } from "@bs42/utils"
import {
  UserIcon,
  KeyRoundIcon,
  MonitorIcon,
  ArrowRightIcon,
} from "lucide-react"
import Link from "next/link"

const overviewLinks = [
  {
    href: "/account/profile",
    icon: UserIcon,
    title: "Profile",
    description: "Update your name, email and avatar",
  },
  {
    href: "/account/password",
    icon: KeyRoundIcon,
    title: "Password",
    description: "Change your password",
  },
  {
    href: "/account/sessions",
    icon: MonitorIcon,
    title: "Sessions",
    description: "Manage your active devices and sessions",
  },
]

const AccountPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/sign-in")

  const { user } = session

  return (
    <div className="grid gap-6">
      {/* Profile summary */}
      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <Avatar className="size-16">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="text-lg">
              {abbreviateName(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="grid gap-1">
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold">{user.name}</p>
              <Badge variant="outline">
                {capitalizeFirstLetter(user.role ?? "user")}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="grid gap-4 @xl/main:grid-cols-3">
        {overviewLinks.map((link) => {
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
    </div>
  )
}

export default AccountPage
