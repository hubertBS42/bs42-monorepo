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
import { Category } from "@bs42/db/client"
import { deleteCategoryAction } from "@/lib/actions/category.actions"
import { useRouter } from "next/navigation"

const DeleteCategory = ({ category }: { category: Category }) => {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { data, isPending: sessionIsLoading } = authClient.useSession()

  if (sessionIsLoading || !data) return <ButtonSkeleton />

  const canDelete = authClient.admin.checkRolePermission({
    role: (data.user.role ?? "user") as SystemRole,
    permissions: {
      category: ["delete"],
    },
  })

  const handleDelete = () => {
    startTransition(async () => {
      const response = await deleteCategoryAction(category.id)

      if (!response.success) {
        toast.error("Operation failed", { description: response.error })
      } else {
        toast.success("Category was successfully deleted.")
        router.push("/catalogue/categories")
      }
    })
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button type="button" className="w-full" variant={"destructive"} disabled={!canDelete}>
          Delete Category
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>{`This action cannot be undone. ${category.name} will permanently deleted.`}</AlertDialogDescription>
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
export default DeleteCategory
