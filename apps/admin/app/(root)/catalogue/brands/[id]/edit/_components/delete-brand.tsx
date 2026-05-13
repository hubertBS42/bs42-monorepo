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
import ButtonSkeleton from "@bs42/ui/components/button-skeleton"
import { Spinner } from "@bs42/ui/components/spinner"
import { authClient } from "@/lib/auth-client"
import { SystemRole } from "@bs42/auth"
import { useState, useTransition } from "react"
import { toast } from "@bs42/ui/components/sonner"
import { Brand } from "@bs42/db/client"
import { deleteBrandAction } from "@/lib/actions/brand.actions"
import { useRouter } from "next/navigation"

const DeleteBrand = ({ brand }: { brand: Brand }) => {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const { data, isPending: sessionIsLoading } = authClient.useSession()
  const router = useRouter()

  if (sessionIsLoading || !data) return <ButtonSkeleton />

  const canDelete = authClient.admin.checkRolePermission({
    role: (data.user.role ?? "user") as SystemRole,
    permissions: {
      brand: ["delete"],
    },
  })

  const handleDelete = () => {
    startTransition(async () => {
      const response = await deleteBrandAction(brand.id)

      if (!response.success) {
        toast.error("Operation failed", { description: response.error })
      } else {
        toast.success("Brand was successfully deleted.")
        router.push("/catalogue/brands")
      }
    })
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button type="button" className="w-full" variant={"destructive"} disabled={!canDelete}>
          Delete Brand
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>{`This action cannot be undone. ${brand.name} will permanently deleted.`}</AlertDialogDescription>
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
export default DeleteBrand
