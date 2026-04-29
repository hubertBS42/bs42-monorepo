"use client"

import InputField from "@bs42/ui/components/input-field"
import { Button } from "@bs42/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@bs42/ui/components/card"
import { generatePassword } from "@/lib/utils"
import { addUserFormSchema } from "@/lib/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form"
import { toast } from "@bs42/ui/components/sonner"
import { z } from "zod"
import { SYSTEM_ROLE_NAMES, STORE_ROLE_NAMES } from "@bs42/auth"
import SelectField from "@bs42/ui/components/select-field"
import { Plus, Trash2 } from "lucide-react"
import { createUserAction } from "@/lib/actions/user.actions"
import ResourceFormHeader from "@/components/resource-form-header"
import ResourceFormFooter from "@/components/resource-form-footer"
import { capitalizeFirstLetter } from "@bs42/utils"
import { Store } from "@/types"

const systemRoleOptions = SYSTEM_ROLE_NAMES.filter(
  (item) => item !== "superAdmin"
).map((role) => ({ label: capitalizeFirstLetter(role), value: role }))
const storeRoleOptions = STORE_ROLE_NAMES.filter(
  (item) => item !== "owner"
).map((role) => ({ label: capitalizeFirstLetter(role), value: role }))

const AddUserForm = () => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [stores, setStores] = useState<Store[]>([])
  const [isStoresLoading, setIsStoresLoading] = useState(false)

  const form = useForm<z.infer<typeof addUserFormSchema>>({
    resolver: zodResolver(addUserFormSchema),
    defaultValues: {
      name: "",
      email: "",
      image: "",
      systemRole: "user",
      stores: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "stores",
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedRole = form.watch("systemRole")
  const isStoreUser = selectedRole === "user"

  // Set first org default after fetch
  useEffect(() => {
    if (!isStoreUser) return

    const fetchStores = async () => {
      setIsStoresLoading(true)
      try {
        const response = await fetch("/api/stores")
        const data: Store[] = await response.json()
        const filtered = data.filter((org) => org.slug !== "global")
        setStores(filtered)
        if (filtered.length) {
          form.setValue("stores", [
            { storeId: filtered[0]?.id ?? "", storeRole: "member" },
          ])
        }
      } catch (error) {
        console.error("Failed to fetch stores:", error)
      } finally {
        setIsStoresLoading(false)
      }
    }

    fetchStores()
  }, [isStoreUser, form])

  const storeOptions = stores.map((store) => ({
    label: store.name,
    value: store.id,
  }))

  const onSubmit: SubmitHandler<z.infer<typeof addUserFormSchema>> = async (
    data
  ) => {
    startTransition(async () => {
      const result = await createUserAction({
        name: data.name,
        email: data.email,
        password: generatePassword({ passwordLength: 16 }),
        systemRole: data.systemRole,
        image: data.image,
        stores: data.systemRole === "user" ? data.stores : undefined,
      })

      if (result.error) {
        if (result.error === "User already exists. Use another email.") {
          form.setError("email", {
            type: "custom",
            message: "This email address is already registered to a user",
          })
        } else {
          toast.error("Failed to create user", { description: result.error })
        }
      }
    })
  }

  const handleDiscard = async () => {
    router.push("/users")
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-y-6">
        <ResourceFormHeader
          heading="Add User"
          description="Create a new user to manage stores and products."
          backTo="/users"
          isPending={isPending}
          isDirty={form.formState.isDirty}
          handleDiscard={handleDiscard}
        />

        <div className="grid gap-8">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>User Details</CardTitle>
                <CardDescription>
                  Basic information about the user.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-5">
                <div className="col-span-2 grid">
                  <InputField
                    control={form.control}
                    label="Full Name"
                    name="name"
                    disabled={isPending}
                    autoFocus
                  />
                </div>
                <div className="col-span-2 grid lg:col-span-1">
                  <InputField
                    control={form.control}
                    label="Email"
                    name="email"
                    type="email"
                    disabled={isPending}
                  />
                </div>
                <div className="col-span-2 grid lg:col-span-1">
                  <SelectField
                    control={form.control}
                    label="System Role"
                    name="systemRole"
                    options={systemRoleOptions}
                    disabled={isPending}
                    loadingPlaceholder="Admin"
                  />
                </div>

                <div className="col-span-2 grid">
                  <InputField
                    control={form.control}
                    name="image"
                    label="Avatar URL"
                    disabled={isPending}
                  />
                </div>
              </CardContent>
            </Card>

            {isStoreUser && (
              <Card>
                <CardHeader>
                  <CardTitle>Store</CardTitle>
                  <CardDescription>
                    Assign this user to one or more stores.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-2 items-end gap-4"
                    >
                      <SelectField
                        control={form.control}
                        label="Store"
                        name={`stores.${index}.storeId`}
                        options={storeOptions}
                        disabled={isPending || isStoresLoading}
                        loadingPlaceholder="Select store"
                      />
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <SelectField
                            control={form.control}
                            label="Member Role"
                            name={`stores.${index}.storeRole`}
                            options={storeRoleOptions}
                            disabled={isPending}
                            loadingPlaceholder="Member"
                          />
                        </div>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant={"outline"}
                            size={"icon"}
                            onClick={() => remove(index)}
                            disabled={isPending}
                            className="mb-0.5"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ storeId: "", storeRole: "member" })}
                    disabled={
                      isPending ||
                      isStoresLoading ||
                      storeOptions.length === fields.length
                    }
                    className="w-full"
                  >
                    <Plus className="size-4" />
                    Add Store
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <ResourceFormFooter
            backTo="/users"
            isPending={isPending}
            isDirty={form.formState.isDirty}
            handleDiscard={handleDiscard}
          />
        </div>
      </div>
    </form>
  )
}
export default AddUserForm
