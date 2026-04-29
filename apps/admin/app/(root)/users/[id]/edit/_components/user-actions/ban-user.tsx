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
import { banUserFormSchema } from "@/lib/zod"
import { useRouter } from "next/navigation"
import DateField from "@bs42/ui/components/date-field"
import TextAreaField from "@bs42/ui/components/textarea-field"
import { Spinner } from "@bs42/ui/components/spinner"
import { User } from "@bs42/db/client"
import { banUserAction } from "@/lib/actions/user.actions"
import { ShieldX } from "lucide-react"

const BanUser = ({ user }: { user: User }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<z.infer<typeof banUserFormSchema>>({
    resolver: zodResolver(banUserFormSchema),
    defaultValues: {
      userId: user.id,
      banReason: "",
      banExpiresIn: null,
    },
  })

  const onSubmit: SubmitHandler<z.infer<typeof banUserFormSchema>> = async (
    values
  ) => {
    startTransition(async () => {
      const response = await banUserAction({
        userId: values.userId,
        banExpiresIn: values.banExpiresIn,
        banReason: values.banReason,
      })
      if (!response.success) {
        toast.error("Operation failed", {
          description: "Something went wrong..",
        })
        return
      }

      startTransition(() => {
        setIsOpen(false)
        form.reset()
        router.push(`/users/${user.id}/edit`)
        toast.success("Operation success", {
          description: "User has been banned.",
        })
      })
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
          <ShieldX className="size-5" />
          Ban User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>
          <DialogDescription>
            Ban user account either temporarily or permanently.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <DateField
                control={form.control}
                name="banExpiresIn"
                label="Ban Expiration"
                disabled={isPending}
                disabledDates={(date) => date < new Date()}
              />
            </div>

            <div className="col-span-2">
              <TextAreaField
                control={form.control}
                label="Ban Reason"
                name="banReason"
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
                {isPending ? <Spinner /> : "Proceed"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
export default BanUser
