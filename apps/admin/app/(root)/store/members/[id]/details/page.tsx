import { Avatar, AvatarFallback, AvatarImage } from "@bs42/ui/components/avatar"
import { Badge } from "@bs42/ui/components/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@bs42/ui/components/card"
import { getStoreMemberById } from "@/lib/data/members.data"
import { abbreviateName, capitalizeFirstLetter } from "@bs42/utils"
import { format } from "date-fns"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import MemberActions from "./_components/member-actions"
import { Button } from "@bs42/ui/components/button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Member Details",
}

type MemberDetailsPageProps = {
  params: Promise<{ id: string }>
}

const MemberDetailsPage = async ({ params }: MemberDetailsPageProps) => {
  const { id } = await params
  const response = await getStoreMemberById(id)

  if (!response.success) throw new Error(response.error)
  if (!response.data) notFound()

  const member = response.data
  const { user } = member

  return (
    <div className="grid gap-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="size-16 rounded-xl">
            <AvatarImage src={user.image ?? ""} alt={user.name} />
            <AvatarFallback className="rounded-xl text-lg">
              {abbreviateName(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="grid">
            <h1 className="text-xl font-bold md:text-2xl">{user.name}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <Button variant="outline" size="sm" asChild>
          <Link href="/store/members">
            <ChevronLeft className="size-4" />
            Back
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Member details and account information
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <p className="text-xs text-muted-foreground">Full Name</p>
                <p className="text-sm font-medium">{user.name}</p>
              </div>
              <div className="grid gap-1">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
              <div className="grid gap-1">
                <p className="text-xs text-muted-foreground">Role</p>
                <div>
                  <Badge
                    variant={
                      member.role === "owner"
                        ? "default"
                        : member.role === "admin"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {capitalizeFirstLetter(member.role)}
                  </Badge>
                </div>
              </div>
              <div className="grid gap-1">
                <p className="text-xs text-muted-foreground">Status</p>
                <div>
                  <Badge variant={user.banned ? "destructive" : "default"}>
                    {user.banned ? "Banned" : "Active"}
                  </Badge>
                </div>
              </div>
              <div className="grid gap-1">
                <p className="text-xs text-muted-foreground">Joined On</p>
                <p className="text-sm font-medium">
                  {format(new Date(member.createdAt), "LLL dd, y")}
                </p>
              </div>
              <div className="grid gap-1">
                <p className="text-xs text-muted-foreground">Email Verified</p>
                <div>
                  <Badge variant={user.emailVerified ? "default" : "outline"}>
                    {user.emailVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <MemberActions member={member} />
      </div>
    </div>
  )
}
export default MemberDetailsPage
