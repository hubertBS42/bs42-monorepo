"use client"

import { Trash } from "lucide-react"
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

const DiscardChangesButton = ({
  isLoading,
  isDisabled,
  handleDiscard,
}: {
  isLoading?: boolean
  isDisabled?: boolean
  handleDiscard: () => Promise<void>
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={"destructive"}
          size={"sm"}
          disabled={isLoading || isDisabled}
          type="button"
        >
          <Trash /> Discard Changes
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes. Are you sure you want to leave this page?
            Any unsaved data will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleDiscard()}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DiscardChangesButton
