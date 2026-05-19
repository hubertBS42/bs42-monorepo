"use client"

import InputField from "@bs42/ui/components/input-field"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@bs42/ui/components/card"
import { Badge } from "@bs42/ui/components/badge"
import { UserDetails } from "@/types"
import { capitalizeFirstLetter } from "@bs42/utils"
import { format } from "date-fns"
import { Control, FieldValues, Path, UseFormClearErrors } from "react-hook-form"
import dynamic from "next/dynamic"
import { Field, FieldGroup, FieldLabel } from "@bs42/ui/components/field"
import { Input } from "@bs42/ui/components/input"
import ImageField from "@bs42/ui/components/image-field"
import ButtonSkeleton from "@bs42/ui/components/button-skeleton"
import Addresses from "./addresses"
import AddAddressDialog from "./addresses/add-address-dialog"
import DateField from "@bs42/ui/components/date-field"
import SwitchCardField from "@bs42/ui/components/switch-card-field"
import PhoneField from "@bs42/ui/components/phone-field"
import { deleteImages, uploadImages } from "@/lib/storage"

const UserActions = dynamic(() => import("./user-actions"), {
  ssr: false,
  loading: () => <ButtonSkeleton />,
})

interface UserFormFieldsProps<T extends FieldValues> {
  control: Control<T>
  user: UserDetails
  isPending: boolean
  clearErrors: UseFormClearErrors<T>
}

const UserFormFields = <T extends FieldValues>({ control, user, isPending, clearErrors }: UserFormFieldsProps<T>) => {
  const handleAddAvatar = async (data: FileList) => {
    const formData = new FormData()
    Array.from(data).forEach((file) => formData.append("files", file))
    return uploadImages(formData)
  }

  const handleRemoveAvatar = async (url: string) => {
    await deleteImages([url])
  }

  return (
    <div className="grid items-stretch gap-4 lg:grid-cols-3">
      <div className="grid gap-4 lg:col-span-2">
        {/* Details card */}
        <Card>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
            <CardDescription>Basic information about the user.</CardDescription>
          </CardHeader>
          <CardContent className="cols-2 grid gap-5">
            <div className="col-span-2 grid">
              <ImageField
                control={control}
                name={"image" as Path<T>}
                sizeLimit={100}
                maxImages={1}
                onAdd={handleAddAvatar}
                onRemove={handleRemoveAvatar}
                clearErrors={clearErrors}
                label="Avatar"
                disabled={isPending}
                className="max-w-25"
                defaultValues={user.image}
              />
            </div>
            <div className="col-span-2 grid">
              <InputField control={control} label="Full Name" name={"name" as Path<T>} disabled={isPending} />
            </div>
            <div className="col-span-2 grid lg:col-span-1">
              <InputField control={control} label="Email" name={"email" as Path<T>} type="email" disabled />
            </div>
            <div className="col-span-2 grid lg:col-span-1">
              <PhoneField control={control} label="Phone" name={"phone" as Path<T>} disabled={isPending} defaultCountry="GH" />
            </div>

            <div className="col-span-2 grid lg:col-span-1">
              <DateField
                control={control}
                name={"dob" as Path<T>}
                label="Date of birth"
                disabled={isPending}
                disabledDates={(date) => date > new Date() || date < new Date("1900-01-01")}
              />
            </div>
            <div className="col-span-2 grid lg:col-span-1">
              <Field className="gap-y-1">
                <FieldLabel>System Role</FieldLabel>
                <Input defaultValue={capitalizeFirstLetter(user.role)} disabled />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Addresses</CardTitle>
            <CardDescription>Lipsum dolor sit amet, consectetur</CardDescription>
          </CardHeader>
          <CardContent>
            <Addresses addresses={user.addresses} />
          </CardContent>
          <CardFooter className="justify-center border-t p-4">
            <AddAddressDialog userId={user.id} />
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Settings for this user.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="gap-3">
              <SwitchCardField
                control={control}
                name={"getMarketingEmails" as Path<T>}
                label="Marketing emails"
                description="Receive emails about new products,  and more."
                disabled={isPending}
              />
              <SwitchCardField
                control={control}
                name={"getSecurityEmails" as Path<T>}
                label="Security emails"
                description="Receive emails about account security."
                disabled={isPending}
              />
              <SwitchCardField control={control} name={"getOrderEmails" as Path<T>} label="Order emails" description="Receive emails about order updates." disabled={isPending} />
            </FieldGroup>
          </CardContent>
        </Card>
      </div>

      <div className="grid content-start gap-4">
        {/* Status card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Status
              {user.banned ? <Badge variant="destructive">Banned</Badge> : <Badge variant="success">Active</Badge>}
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
                  <p className="text-muted-foreground">{user.banExpires ? format(user.banExpires, "LLL dd, y") : "N/A"}</p>
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
