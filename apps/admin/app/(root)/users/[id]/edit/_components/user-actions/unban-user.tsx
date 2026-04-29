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
import { unbanUserAction } from "@/lib/actions/user.actions"
import { User } from "@bs42/db/client"
import { Loader, ShieldCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "@bs42/ui/components/sonner"

const UnbanUser = ({ user }: { user: User }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleUnban = () => {
    startTransition(async () => {
      const response = await unbanUserAction(user.id)
      if (!response.success) {
        toast.error("Operation failed", {
          description: "Something went wrong...",
        })
        return
      }

      startTransition(() => {
        setIsOpen(false)
        router.push(`/users/${user.id}/edit`)
        toast.success("Operation success", {
          description: "The user has been successfully unbanned.",
        })
      })
    })
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          className="w-full text-red-500 hover:bg-red-50 hover:text-red-700"
          variant={"outline"}
        >
          <ShieldCheck className="size-5" /> Unban User
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {`You are about to unban ${user.name}'s account allowing them to access the application again. Do you still wish to proceed?`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleUnban()
            }}
            disabled={isPending}
          >
            {isPending ? <Loader className="size-4 animate-spin" /> : "Proceed"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
export default UnbanUser
