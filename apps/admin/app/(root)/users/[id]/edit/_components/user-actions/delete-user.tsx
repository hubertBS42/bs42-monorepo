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
import { deleteUserAction } from "@/lib/actions/user.actions"
import { User } from "@bs42/db/client"
import { Trash2 } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "@bs42/ui/components/sonner"

const DeleteUser = ({ user }: { user: User }) => {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)

  const handleDelete = () => {
    startTransition(async () => {
      const response = await deleteUserAction(user)

      if (response.error) {
        setIsOpen(false)
        toast.error(response.error)
        return
      }
    })
  }
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button type="button" className="w-full" variant={"destructive"}>
          <Trash2 className="size-4" />
          Delete User
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {`This action cannot be undone. ${user.name}'s account and all associated resources will be permanently deleted from the system.`}
          </AlertDialogDescription>
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
export default DeleteUser
