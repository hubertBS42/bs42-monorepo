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
import { Spinner } from "@bs42/ui/components/spinner"
import { Store } from "@/types"
import { authClient } from "@/lib/auth-client"
import { useState, useTransition } from "react"
import { toast } from "@bs42/ui/components/sonner"
import { StoreRole } from "@bs42/auth"
import { Trash2 } from "lucide-react"
import { useStoreSwitcher } from "@/hooks/use-store-switch"
import ButtonSkeleton from "@bs42/ui/components/button-skeleton"

const DeleteStore = ({ store }: { store: Store }) => {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const { switchStore, isSwitching } = useStoreSwitcher()
  const { data, isPending: activeMemberRoleIsLoading } = authClient.useActiveMemberRole()

  if (activeMemberRoleIsLoading || !data) return <ButtonSkeleton />

  const canDelete = authClient.organization.checkRolePermission({
    role: (data.role ?? "member") as StoreRole,
    permissions: {
      organization: ["delete"],
    },
  })

  const handleDelete = () => {
    startTransition(async () => {
      await authClient.organization.delete(
        { organizationId: store.id },
        {
          onError: (ctx) => {
            setIsOpen(false)
            toast.error("Failed to delete store", {
              description: ctx.error.message,
            })
          },
          onSuccess: async () => {
            // Switch to global workspace after deletion
            await switchStore({ storeSlug: "global" })
            toast.success(`${store.name} has been deleted successfully.`)
          },
        }
      )
    })
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive" className="w-full" disabled={!canDelete}>
          <Trash2 className="size-4" />
          Delete Store
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>{`This action cannot be undone. ${store.name} and all related data will be permanently deleted.`}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending || isSwitching}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isPending || isSwitching}
            className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
          >
            {isPending || isSwitching ? <Spinner /> : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteStore
