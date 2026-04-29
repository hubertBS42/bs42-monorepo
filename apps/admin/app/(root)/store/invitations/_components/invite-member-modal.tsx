"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@bs42/ui/components/dialog"
import { Button } from "@bs42/ui/components/button"
import { FieldGroup } from "@bs42/ui/components/field"
import InputField from "@bs42/ui/components/input-field"
import { authClient } from "@/lib/auth-client"
import { STORE_ROLE_NAMES, StoreRole } from "@bs42/auth"
import { inviteMemberFormSchema } from "@/lib/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { capitalizeFirstLetter } from "@bs42/utils"
import { UserPlus } from "lucide-react"
import { useState, useTransition } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { toast } from "@bs42/ui/components/sonner"
import { z } from "zod"
import { Spinner } from "@bs42/ui/components/spinner"
import RoleSelector from "@/components/role-selector"
import { inviteMemberAction } from "@/lib/actions/invitation.actions"

const InviteMemberModal = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof inviteMemberFormSchema>>({
    resolver: zodResolver(inviteMemberFormSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  })

  const { data: activeMember, isPending: isActiveMemberLoading } =
    authClient.useActiveMember()

  if (isActiveMemberLoading || !activeMember) return null

  const canInvite = authClient.organization.checkRolePermission({
    role: (activeMember?.role ?? "member") as StoreRole,
    permissions: { invitation: ["create"] },
  })

  const roleOptions = STORE_ROLE_NAMES.filter((role) => role !== "owner").map(
    (role) => ({ label: capitalizeFirstLetter(role), value: role })
  )

  const onSubmit: SubmitHandler<
    z.infer<typeof inviteMemberFormSchema>
  > = async (data) => {
    startTransition(async () => {
      const response = await inviteMemberAction({
        email: data.email,
        role: data.role,
      })

      if (!response.success) {
        if (response.error === "User is already invited to this store") {
          form.setError("email", {
            type: "custom",
            message: "User is already invited to this store",
          })
        } else {
          toast.error("Operation failed", { description: response.error })
        }
        return
      }

      toast.success("Invitation sent", {
        description: `An invitation has been sent to ${data.email}.`,
      })
      form.reset()
      setIsOpen(false)
    })
  }

  if (!canInvite) return null

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) form.reset()
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="size-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Send an invitation to a new member to join this store.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-6">
            <FieldGroup>
              <InputField
                control={form.control}
                label="Email"
                name="email"
                type="email"
                disabled={isPending}
                autoFocus
              />
              <RoleSelector
                control={form.control}
                isDisabled={isPending}
                isPending={isPending}
                options={roleOptions}
                permissionType="store"
              />
            </FieldGroup>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => {
                  form.reset()
                  setIsOpen(false)
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || !form.formState.isDirty}
              >
                {isPending ? <Spinner /> : "Send Invite"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default InviteMemberModal
