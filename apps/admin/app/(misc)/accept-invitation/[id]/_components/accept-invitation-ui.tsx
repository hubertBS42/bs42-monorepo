"use client"

import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Button } from "@bs42/ui/components/button"
import { Spinner } from "@bs42/ui/components/spinner"
import { toast } from "@bs42/ui/components/sonner"
import {
  acceptInvitationAction,
  rejectInvitationAction,
} from "@/lib/actions/invitation.actions"
import { InvitationWithInviterWithStore } from "@/types"

const AcceptInvitationUI = ({
  invitation,
}: {
  invitation: InvitationWithInviterWithStore
}) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleAccept = () => {
    startTransition(async () => {
      const response = await acceptInvitationAction({
        invitationId: invitation.id,
      })

      if (!response.success) {
        toast.error("Failed to accept invitation", {
          description: response.error,
        })
        return
      }

      // Set the accepted organization as active
      await authClient.organization.setActive({
        organizationId: invitation.organizationId,
      })
      toast.success("Invitation accepted")
      router.push("/")
    })
  }

  const handleReject = () => {
    startTransition(async () => {
      const response = await rejectInvitationAction({
        invitationId: invitation.id,
      })

      if (!response.success) {
        toast.error("Failed to reject invitation", {
          description: response.error,
        })
        return
      }

      toast.success("Invitation rejected")
      router.push("/")
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="grid w-full max-w-md gap-6 p-6 text-center">
        <div className="grid gap-2">
          <h1 className="text-2xl font-bold">You have been invited</h1>
          <p className="text-sm text-muted-foreground">{`You have been invited by ${invitation.inviter.name} to join ${invitation.organization.name} as ${invitation.role}. Would you like to accept?`}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleReject}
            disabled={isPending}
          >
            {isPending ? <Spinner /> : "Decline"}
          </Button>
          <Button
            className="flex-1"
            onClick={handleAccept}
            disabled={isPending}
          >
            {isPending ? <Spinner /> : "Accept"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AcceptInvitationUI
