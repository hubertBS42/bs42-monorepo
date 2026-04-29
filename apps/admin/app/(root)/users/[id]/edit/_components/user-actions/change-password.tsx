"use client"
import { Button } from "@bs42/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@bs42/ui/components/dialog"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { toast } from "@bs42/ui/components/sonner"
import { z } from "zod"
import { KeyRound, Loader } from "lucide-react"
import { changePasswordFormSchema } from "@/lib/zod"
import { authClient } from "@/lib/auth-client"
import PasswordField from "@bs42/ui/components/password-field"

const ChangePassword = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof changePasswordFormSchema>>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit: SubmitHandler<
    z.infer<typeof changePasswordFormSchema>
  > = async (values) => {
    startTransition(async () => {
      await authClient.changePassword(
        {
          currentPassword: values.currentPassword,
          newPassword: values.password,
          revokeOtherSessions: true,
        },
        {
          onSuccess: () => {
            setIsOpen(false)
            form.reset()
            toast.success("Operation success", {
              description: "Your password has been changed.",
            })
          },
          onError: (ctx) => {
            if (ctx.error.code === "INVALID_PASSWORD") {
              form.setError("currentPassword", {
                type: "custom",
                message: "This password is incorrect.",
              })
            } else {
              toast.error("Operation failed", {
                description: ctx.error.message,
              })
            }
          },
        }
      )
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="w-full text-red-500 hover:bg-red-50 hover:text-red-700"
          variant={"outline"}
        >
          <KeyRound className="size-4" />
          Change Password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new one to update your
            password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <PasswordField
                control={form.control}
                name="currentPassword"
                label="Current Password"
                disabled={isPending}
              />
            </div>

            <div className="col-span-2">
              <PasswordField
                control={form.control}
                name="password"
                label="New Password"
                disabled={isPending}
              />
            </div>
            <div className="col-span-2">
              <PasswordField
                control={form.control}
                name="confirmPassword"
                label="Confirm Password"
                disabled={isPending}
              />
            </div>
            <div className="col-span-2">
              <Button
                className="w-full"
                type="button"
                onClick={() => form.handleSubmit(onSubmit)()}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <KeyRound className="size-4" /> Change Password
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
export default ChangePassword
