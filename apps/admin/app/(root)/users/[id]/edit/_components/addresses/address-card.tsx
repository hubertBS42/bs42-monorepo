"use client"

import { Badge } from "@bs42/ui/components/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@bs42/ui/components/dropdown-menu"
import { Button } from "@bs42/ui/components/button"
import { MoreVertical } from "lucide-react"
import { memo, useState, useTransition } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@bs42/ui/components/alert-dialog"
import { deleteAddressAction } from "@/lib/actions/user.actions"
import { toast } from "@bs42/ui/components/sonner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@bs42/ui/components/dialog"
import EditAddressDialog from "./edit-address-dialog"
import { useRouter } from "next/navigation"
import { Address } from "@bs42/db/client"
import { Spinner } from "@bs42/ui/components/spinner"

const AddressCard = ({ address }: { address: Address }) => {
  const [dropdownIsOpen, setDropdownIsOpen] = useState(false)
  const [dialogIsOpen, setDialogIsOpen] = useState(false)
  const [alertDialogIsOpen, setAlertDialogIsOpen] = useState(false)
  const router = useRouter()

  const [isPending, startTransition] = useTransition()

  const handleDeleteAddress = async () => {
    startTransition(async () => {
      const res = await deleteAddressAction(address.id)

      if (!res.success) {
        toast.error("Operation failed", { description: res.error })
      } else {
        router.refresh()
        toast.success("Address deleted successfully.")
      }
    })
  }
  return (
    <div className="grid border-b py-4 first:pt-0 last:border-b-0 last:pb-0">
      <h3 className="flex items-center justify-between text-sm font-normal">
        {address.name}
        <div className="flex items-center gap-x-1">
          {address.isDefault && <Badge>Default</Badge>}
          <DropdownMenu open={dropdownIsOpen} onOpenChange={setDropdownIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant={"ghost"}>
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  setDropdownIsOpen(false)
                  setDialogIsOpen(true)
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={(e) => {
                  e.preventDefault()
                  setDropdownIsOpen(false)
                  setAlertDialogIsOpen(true)
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Edit address dialog */}
          <Dialog open={dialogIsOpen} onOpenChange={setDialogIsOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit address</DialogTitle>
                <DialogDescription>Lorem ipsum dolor sit, amet consectetur adipisicing elit.</DialogDescription>
              </DialogHeader>

              <EditAddressDialog address={address} setDialogIsOpen={setDialogIsOpen} />
            </DialogContent>
          </Dialog>

          {/* Delete address alert dialog */}
          <AlertDialog open={alertDialogIsOpen} onOpenChange={setAlertDialogIsOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone. This will permanently delete the following address.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault()
                    handleDeleteAddress()
                  }}
                  disabled={isPending}
                >
                  {isPending ? <Spinner /> : "Continue"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </h3>
      <div className="grid gap-y-2">
        <p className="text-sm leading-4.5 text-muted-foreground">
          {address.line1}, <br />
          {address.line2 && (
            <>
              {address.line2},<br />
            </>
          )}
          {address.town}, {address.region}
        </p>
        <p className="text-sm text-muted-foreground">{address.phone}</p>
      </div>
    </div>
  )
}
export default memo(AddressCard)
