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
import { requestPasswordResetAction } from "@/lib/actions/user.actions"
import { User } from "@bs42/db/client"
import { Loader, RotateCcw } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "@bs42/ui/components/sonner"

const ResetPassword = ({ user }: { user: User }) => {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)

  const handleReset = () => {
    startTransition(async () => {
      const response = await requestPasswordResetAction({
        email: user.email,
        redirectTo: "/set-password?action=reset",
        actor: "admin",
      })

      if (!response.success) {
        toast.error("Operation failed", { description: response.error })
      }

      setIsOpen(false)
      toast.success("Operation success", {
        description: "Reset email has been sent.",
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
          <RotateCcw />
          Reset Password
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>{`An email with a password reset link is about to be sent to ${user.name}, do you wish to continue?`}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleReset()
            }}
            disabled={isPending}
          >
            {isPending ? (
              <Loader className="size-4 animate-spin" />
            ) : (
              "Continue"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
export default ResetPassword
