"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "@bs42/ui/components/sonner"
import { Button } from "@bs42/ui/components/button"
import { deleteListingAction } from "@/lib/actions/listing.actions"
import { Product, StoreListing } from "@bs42/db/client"
import { authClient } from "@/lib/auth-client"
import ButtonSkeleton from "@bs42/ui/components/button-skeleton"
import { StoreRole } from "@bs42/auth"
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
import { Spinner } from "@bs42/ui/components/spinner"

const DeleteListing = ({ listing }: { listing: StoreListing & { product: Product } }) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)

  const { data: activeMember, isPending: isActiveMemberLoading } = authClient.useActiveMember()

  if (isActiveMemberLoading || !activeMember) return <ButtonSkeleton />

  const canRemove = authClient.organization.checkRolePermission({
    role: (activeMember?.role ?? "member") as StoreRole,
    permissions: { listing: ["delete"] },
  })

  const handleDelete = () => {
    startTransition(async () => {
      const response = await deleteListingAction(listing.id)
      if (!response.success) {
        toast.error("Operation failed", { description: response.error })
      } else {
        toast.success("Listing removed successfully.")
        router.push("/store/listings")
      }
    })
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button type="button" className="w-full" variant={"destructive"} disabled={!canRemove}>
          Remove Listing
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>{`This action cannot be undone. ${listing.product.name} will be removed from this store.`}</AlertDialogDescription>
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

export default DeleteListing
