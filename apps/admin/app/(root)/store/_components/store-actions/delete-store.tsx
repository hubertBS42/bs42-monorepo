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
import { Skeleton } from "@bs42/ui/components/skeleton"
import { Trash2 } from "lucide-react"
import { useStoreSwitcher } from "@/hooks/use-store-switch"

const DeleteStore = ({ store }: { store: Store }) => {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const { switchStore, isSwitching } = useStoreSwitcher()
  const { data, isPending: isActiveMemberRoleLoading } =
    authClient.useActiveMemberRole()

  const canDelete = authClient.organization.checkRolePermission({
    role: (data?.role ?? "member") as StoreRole,
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
          },
        }
      )
    })
  }

  if (isActiveMemberRoleLoading) return <Skeleton className="h-9 rounded-md" />
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="destructive"
          className="w-full"
          disabled={!canDelete}
        >
          <Trash2 className="size-4" />
          Delete Store
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>{`This action cannot be undone. ${store.name} and all its call recordings will be permanently deleted.`}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending || isSwitching}>
            Cancel
          </AlertDialogCancel>
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
