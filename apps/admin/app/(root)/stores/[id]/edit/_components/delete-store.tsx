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
import { authClient } from "@/lib/auth-client"
import { StoreRole } from "@bs42/auth"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "@bs42/ui/components/sonner"
import { Store } from "@/types"

const DeleteStore = ({ store }: { store: Store }) => {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
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
        {
          organizationId: store.id,
        },
        {
          onSuccess: () => {
            startTransition(() => {
              setIsOpen(false)
              router.push("/stores")
              toast.success("Store has been deleted.")
            })
          },
          onError: (ctx) => {
            startTransition(() => {
              setIsOpen(false)
              toast.error(ctx.error.message)
            })
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
          className="w-full"
          variant={"destructive"}
          disabled={!canDelete}
        >
          Delete store
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>{`This action cannot be undone. ${store.name} and all related data will be permanently deleted.`}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isPending}
          >
            {isPending ? <Spinner /> : "Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
export default DeleteStore
