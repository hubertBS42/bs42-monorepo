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
import SessionsList from "./_components/sessions-list"

const SessionsPage = async () => {
  const headersObj = await headers()
  const session = await auth.api.getSession({ headers: headersObj })
  if (!session) redirect("/sign-in")

  const sessions = await auth.api.listSessions({ headers: headersObj })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessions</CardTitle>
        <CardDescription>
          Manage your active sessions across all devices. Revoking a session
          will sign you out of that device.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SessionsList
          sessions={sessions}
          currentSessionId={session.session.id}
        />
      </CardContent>
    </Card>
  )
}

export default SessionsPage
