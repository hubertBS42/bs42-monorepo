"use client"

import { Badge } from "@bs42/ui/components/badge"
import { Button } from "@bs42/ui/components/button"
import { Spinner } from "@bs42/ui/components/spinner"
import { revokeSessionAction } from "@/lib/actions/account.actions"
import { formatDistanceToNow } from "date-fns"
import { MonitorIcon, SmartphoneIcon, GlobeIcon } from "lucide-react"
import { useTransition } from "react"
import { toast } from "@bs42/ui/components/sonner"
import { useRouter } from "next/navigation"
import { Session } from "@/lib/auth"

type SessionOnly = Session["session"]

interface SessionsListProps {
  sessions: SessionOnly[]
  currentSessionId: string
}

// Create a dedicated component for the device icon
const DeviceIcon = ({ userAgent }: { userAgent?: string | null }) => {
  if (!userAgent) return <GlobeIcon className="size-5 text-muted-foreground" />
  if (/mobile|android|iphone/i.test(userAgent))
    return <SmartphoneIcon className="size-5 text-muted-foreground" />
  return <MonitorIcon className="size-5 text-muted-foreground" />
}

const getDeviceLabel = (userAgent?: string | null) => {
  if (!userAgent) return "Unknown device"
  if (/mobile|android|iphone/i.test(userAgent)) return "Mobile device"
  if (/windows/i.test(userAgent)) return "Windows PC"
  if (/mac/i.test(userAgent)) return "Mac"
  if (/linux/i.test(userAgent)) return "Linux"
  return "Desktop"
}

const SessionItem = ({
  session,
  currentSessionId,
}: {
  session: SessionOnly
  currentSessionId: string
}) => {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const isCurrent = session.id === currentSessionId
  const userAgent = session.userAgent

  const handleRevoke = () => {
    startTransition(async () => {
      const result = await revokeSessionAction(session.token)
      if (!result.success) {
        toast.error("Failed to revoke session", { description: result.error })
        return
      }
      toast.success("Session revoked")
      router.refresh()
    })
  }

  return (
    <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <DeviceIcon userAgent={userAgent} />
        </div>
        <div className="grid gap-0.5">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{getDeviceLabel(userAgent)}</p>
            {isCurrent && (
              <Badge variant="outline" className="text-xs">
                Current
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {session.ipAddress ?? "Unknown IP"} · Active{" "}
            {formatDistanceToNow(new Date(session.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>
      {!isCurrent && (
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={handleRevoke}
        >
          {isPending ? <Spinner /> : "Revoke"}
        </Button>
      )}
    </div>
  )
}

const SessionsList = ({ sessions, currentSessionId }: SessionsListProps) => {
  return (
    <div className="flex flex-col divide-y">
      {sessions.map((session) => (
        <SessionItem
          key={session.id}
          session={session}
          currentSessionId={currentSessionId}
        />
      ))}
    </div>
  )
}

export default SessionsList
