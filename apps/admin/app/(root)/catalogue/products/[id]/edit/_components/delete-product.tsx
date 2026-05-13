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
import { deleteProductAction } from "@/lib/actions/product.actions"
import { useRouter } from "next/navigation"
import { Product } from "@bs42/db/client"

const DeleteProduct = ({ product }: { product: Product }) => {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { data, isPending: sessionIsLoading } = authClient.useSession()

  if (sessionIsLoading || !data) return <ButtonSkeleton />

  const canDelete = authClient.admin.checkRolePermission({
    role: (data.user.role ?? "user") as SystemRole,
    permissions: {
      product: ["delete"],
    },
  })

  const handleDelete = () => {
    startTransition(async () => {
      const response = await deleteProductAction(product.id)

      if (!response.success) {
        toast.error("Operation failed", { description: response.error })
      } else {
        toast.success("Product was successfully deleted.")
        router.push("/catalogue/products")
      }
    })
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button type="button" className="w-full" variant={"destructive"} disabled={!canDelete}>
          Delete Product
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>{`This action cannot be undone. ${product.name} will permanently deleted.`}</AlertDialogDescription>
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
export default DeleteProduct
