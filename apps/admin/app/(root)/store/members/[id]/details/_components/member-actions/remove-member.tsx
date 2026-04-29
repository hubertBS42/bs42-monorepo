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
import { MemberWithUserWithSessions } from "@/types"
import { removeStoreMemberAction } from "@/lib/actions/member.actions"
import { BadgeMinus } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "@bs42/ui/components/sonner"

const RemoveMember = ({ member }: { member: MemberWithUserWithSessions }) => {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)

  const handleRemove = () => {
    startTransition(async () => {
      const response = await removeStoreMemberAction({
        memberId: member.id,
        storeId: member.organizationId,
      })

      if (response.error) {
        setIsOpen(false)
        toast.error("Operation failed", { description: response.error })
      }
    })
  }
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button type="button" className="w-full" variant={"destructive"}>
          <BadgeMinus className="size-4" />
          Remove Member
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>{`This action cannot be undone. ${member.user.name} will be removed from this store.`}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleRemove()
            }}
            disabled={isPending}
          >
            {isPending ? <Spinner /> : "Proceed"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
export default RemoveMember
