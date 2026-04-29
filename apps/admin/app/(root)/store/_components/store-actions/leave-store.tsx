"use client"

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
import { Button } from "@bs42/ui/components/button"
import { Skeleton } from "@bs42/ui/components/skeleton"
import { Spinner } from "@bs42/ui/components/spinner"
import { leaveStoreAction } from "@/lib/actions/member.actions"
import { authClient } from "@/lib/auth-client"
import { DoorOpen } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "@bs42/ui/components/sonner"

const LeaveStore = () => {
  const [isPending, startTransition] = useTransition()
  const { data: activeStore, isPending: isActiveStorePending } =
    authClient.useActiveOrganization()
  const [isOpen, setIsOpen] = useState(false)

  if (isActiveStorePending || !activeStore)
    return <Skeleton className="h-9 w-full" />

  const handleLeave = () => {
    startTransition(async () => {
      const response = await leaveStoreAction({ storeId: activeStore.id })

      if (!response.success) {
        setIsOpen(false)
        toast.error("Operation failed", { description: response.error })
        return
      }
    })
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button type="button" className="w-full" variant="destructive">
          <DoorOpen className="size-4" />
          Leave Store
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>{`You will be removed from ${activeStore.name} and will lose access to all its resources.`}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleLeave()
            }}
            disabled={isPending}
            className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
          >
            {isPending ? <Spinner /> : "Proceed"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default LeaveStore
