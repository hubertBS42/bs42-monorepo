"use client"

import InputField from "@bs42/ui/components/input-field"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@bs42/ui/components/card"
import { Badge } from "@bs42/ui/components/badge"
import { UserWithSessionsAndMemberships } from "@/types"
import { capitalizeFirstLetter } from "@bs42/utils"
import { format } from "date-fns"
import { Control, FieldValues, Path } from "react-hook-form"
import dynamic from "next/dynamic"
import { Skeleton } from "@bs42/ui/components/skeleton"
import { Field, FieldLabel } from "@bs42/ui/components/field"
import { Input } from "@bs42/ui/components/input"

const UserActions = dynamic(() => import("./user-actions"), {
  ssr: false,
  loading: () => <Skeleton className="h-10 w-full" />,
})

interface UserFormFieldsProps<T extends FieldValues> {
  control: Control<T>
  user: UserWithSessionsAndMemberships
  isPending: boolean
}

const UserFormFields = <T extends FieldValues>({
  control,
  user,
  isPending,
}: UserFormFieldsProps<T>) => {
  return (
    <div className="grid items-stretch gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {/* Details card */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>User Details</CardTitle>
            <CardDescription>Basic information about the user.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <InputField
              control={control}
              label="Full Name"
              name={"name" as Path<T>}
              disabled={isPending}
            />
            <InputField
              control={control}
              label="Email"
              name={"email" as Path<T>}
              type="email"
              disabled
            />
            <Field className="gap-y-1">
              <FieldLabel>System Role</FieldLabel>
              <Input defaultValue={capitalizeFirstLetter(user.role)} disabled />
            </Field>
            <InputField
              control={control}
              name={"image" as Path<T>}
              label="Avatar URL"
              disabled={isPending}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid content-start gap-4">
        {/* Status card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Status
              {user.banned ? (
                <Badge variant="destructive">Banned</Badge>
              ) : (
                <Badge>Active</Badge>
              )}
            </CardTitle>
          </CardHeader>
          {user.banned && (
            <CardContent>
              <div className="grid gap-y-5 text-sm">
                <div>
                  <h3 className="font-medium">Ban Reason:</h3>
                  <p className="text-muted-foreground">{user.banReason}</p>
                </div>
                <div>
                  <h3 className="font-medium">Ban Expiration:</h3>
                  <p className="text-muted-foreground">
                    {user.banExpires
                      ? format(user.banExpires, "LLL dd, y")
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Actions card */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Perform actions on this user.</CardDescription>
          </CardHeader>
          <CardContent>
            <UserActions user={user} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default UserFormFields
