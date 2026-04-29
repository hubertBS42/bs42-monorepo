import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@bs42/ui/components/card"
import UpdateProfileForm from "./_components/update-profile-form"

const ProfilePage = async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/sign-in")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your personal information.</CardDescription>
      </CardHeader>
      <CardContent>
        <UpdateProfileForm user={session.user} />
      </CardContent>
    </Card>
  )
}

export default ProfilePage
