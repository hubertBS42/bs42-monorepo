"use client"

import { useState, useTransition } from "react"
import { Invitation } from "@bs42/db/client"
import { Button } from "@bs42/ui/components/button"
import { Spinner } from "@bs42/ui/components/spinner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@bs42/ui/components/alert-dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@bs42/ui/components/sheet"
import { Badge } from "@bs42/ui/components/badge"
import { format } from "date-fns"
import { capitalizeFirstLetter } from "@bs42/utils"
import {
  cancelInvitationAction,
  resendInvitationAction,
} from "@/lib/actions/invitation.actions"
import { toast } from "@bs42/ui/components/sonner"
import { InfoIcon, Repeat2, CircleSlash } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@bs42/ui/components/tooltip"

const InvitationActions = ({ invitation }: { invitation: Invitation }) => {
  const [isPending, startTransition] = useTransition()
  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const router = useRouter()

  const handleCancel = () => {
    startTransition(async () => {
      const result = await cancelInvitationAction(invitation.id)
      if (!result.success) {
        toast.error("Failed to cancel invitation", {
          description: result.error,
        })
        return
      }
      toast.success("Invitation cancelled")
      setIsCancelOpen(false)
      router.refresh()
    })
  }

  const handleResend = () => {
    startTransition(async () => {
      const result = await resendInvitationAction(invitation.id)
      if (!result.success) {
        toast.error("Failed to resend invitation", {
          description: result.error,
        })
        return
      }
      toast.success("Invitation resent", {
        description: `A new invitation has been sent to ${invitation.email}`,
      })
      router.refresh()
    })
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {/* Details */}
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetTrigger asChild>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <InfoIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Details</p>
            </TooltipContent>
          </Tooltip>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Invitation Details</SheetTitle>
            <SheetDescription>
              Details of store invitation that has been sent.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 px-4 text-sm">
            <div className="grid gap-1">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium">{invitation.email}</p>
            </div>
            <div className="grid gap-1">
              <p className="text-xs text-muted-foreground">Role</p>
              <Badge variant="outline" className="w-fit">
                {capitalizeFirstLetter(invitation.role as string)}
              </Badge>
            </div>
            <div className="grid gap-1">
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge variant="outline" className="w-fit">
                {capitalizeFirstLetter(invitation.status)}
              </Badge>
            </div>
            <div className="grid gap-1">
              <p className="text-xs text-muted-foreground">Invited On</p>
              <p className="font-medium">
                {format(new Date(invitation.expiresAt), "LLL dd, y")}
              </p>
            </div>
            <div className="grid gap-1">
              <p className="text-xs text-muted-foreground">Expires At</p>
              <p className="font-medium">
                {format(new Date(invitation.expiresAt), "LLL dd, y HH:mm")}
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Resend */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={isPending}
            onClick={handleResend}
          >
            {isPending ? <Spinner /> : <Repeat2 className="size-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Resend</p>
        </TooltipContent>
      </Tooltip>

      {/* Cancel */}
      <AlertDialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <AlertDialogTrigger asChild>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-destructive hover:text-destructive"
              >
                <CircleSlash className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Cancel</p>
            </TooltipContent>
          </Tooltip>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              {`Are you sure you want to cancel the invitation sent to ${invitation.email}? They will no longer be able to join the organization using this invitation.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Keep</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleCancel()
              }}
              disabled={isPending}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              {isPending ? <Spinner /> : "Cancel Invitation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default InvitationActions
