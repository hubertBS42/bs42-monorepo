"use client"
import InputField from "@bs42/ui/components/input-field"
import SelectField from "@bs42/ui/components/select-field"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@bs42/ui/components/card"
import { Checkbox } from "@bs42/ui/components/checkbox"
import { Field, FieldGroup, FieldLabel } from "@bs42/ui/components/field"
import { STORE_PLAN_OPTIONS, STORE_STATUS_OPTIONS } from "@/constants"
import { authClient } from "@/lib/auth-client"
import { updateStoreFormSchema } from "@/lib/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { notFound, useRouter } from "next/navigation"
import { use, useEffect, useState, useTransition } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import slugify from "slugify"
import { toast } from "@bs42/ui/components/sonner"
import { z } from "zod"
import DeleteStore from "./delete-store"
import ResourceFormHeader from "@/components/resource-form-header"
import ResourceFormFooter from "@/components/resource-form-footer"
import { DataResponse } from "@bs42/types"
import { Store, StorePlan, StoreStatus } from "@/types"

const EditStoreForm = ({
  data,
}: {
  data: Promise<DataResponse<Store | null>>
}) => {
  const response = use(data)
  if (!response.success) throw new Error(response.error)
  if (!response.data) notFound()

  const store = response.data

  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [autoGenSlug, setAutoGenSlug] = useState(false)

  const form = useForm<z.infer<typeof updateStoreFormSchema>>({
    resolver: zodResolver(updateStoreFormSchema),
    defaultValues: {
      id: store.id,
      name: store.name,
      slug: store.slug,
      logo: store.logo ?? "",
      plan: store.plan as StorePlan,
      status: store.status as StoreStatus,
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const nameValue = form.watch("name")

  useEffect(() => {
    if (!autoGenSlug) return

    const slugified = slugify(nameValue, {
      lower: true,
      strict: true,
      remove: /\./g,
    })
    form.setValue("slug", slugified, { shouldDirty: false })
  }, [nameValue, autoGenSlug, form])

  const handleAutoGenSlug = (checked: boolean) => {
    setAutoGenSlug(checked)
    if (checked) {
      // Re-generate slug from current name when re-enabling
      const slugified = slugify(nameValue, {
        lower: true,
        strict: true,
        remove: /\./g,
      })
      form.setValue("slug", slugified, { shouldDirty: false })
    }
  }

  const onSubmit: SubmitHandler<z.infer<typeof updateStoreFormSchema>> = async (
    storeData
  ) => {
    startTransition(async () => {
      // Check slug availability only if it changed
      if (storeData.slug !== store.slug) {
        const { error: checkSlugError } =
          await authClient.organization.checkSlug({
            slug: storeData.slug,
          })

        if (checkSlugError) {
          return form.setError("slug", {
            type: "custom",
            message: checkSlugError.message,
          })
        }
      }

      const { error: updateStoreErr } = await authClient.organization.update({
        data: {
          name: storeData.name,
          slug: storeData.slug,
          logo: storeData.logo,
          plan: storeData.plan,
          status: storeData.status,
        },
        organizationId: store.id,
      })

      if (updateStoreErr) {
        toast.error("Operation failed", { description: updateStoreErr.message })
        return
      }

      toast.success("Store updated successfully.")
      router.push("/stores")
    })
  }
  const handleDiscard = async () => {
    router.push("/stores")
  }
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-y-6">
        <ResourceFormHeader
          heading="Edit Store"
          description="Update store's details and status."
          backTo="/stores"
          isPending={isPending}
          isDirty={form.formState.isDirty}
          handleDiscard={handleDiscard}
        />

        <div className="grid gap-8">
          <div className="grid items-start gap-4 lg:grid-cols-3">
            {/* Left column */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Store Details</CardTitle>
                  <CardDescription>
                    Configure the basic information and settings for this store.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <InputField
                      control={form.control}
                      label="Name"
                      name="name"
                      disabled={isPending}
                      autoFocus
                    />
                    <Field>
                      <InputField
                        control={form.control}
                        label="Slug"
                        name="slug"
                        disabled={autoGenSlug || isPending}
                      />
                      <Field orientation="horizontal">
                        <Checkbox
                          id="autoGenSlug"
                          checked={autoGenSlug}
                          onCheckedChange={(checked) =>
                            handleAutoGenSlug(Boolean(checked))
                          }
                        />
                        <FieldLabel
                          htmlFor="autoGenSlug"
                          className="font-light"
                        >
                          Auto generate slug
                        </FieldLabel>
                      </Field>
                    </Field>
                    <SelectField
                      control={form.control}
                      label="Plan"
                      name="plan"
                      disabled={isPending}
                      loadingPlaceholder="Basic"
                      options={STORE_PLAN_OPTIONS}
                    />
                    <InputField
                      control={form.control}
                      name="logo"
                      label="Logo URL"
                      disabled={isPending}
                    />
                  </FieldGroup>
                </CardContent>
              </Card>
            </div>

            {/* Right column */}
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Store Status</CardTitle>
                  <CardDescription>
                    Set the status for this store.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SelectField
                    control={form.control}
                    name="status"
                    disabled={isPending}
                    loadingPlaceholder="Active"
                    options={STORE_STATUS_OPTIONS}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Danger Zone</CardTitle>
                  <CardDescription>
                    Permanently delete this organization and all associated
                    data.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DeleteStore store={store} />
                </CardContent>
              </Card>
            </div>
          </div>
          <ResourceFormFooter
            backTo="/stores"
            isPending={isPending}
            isDirty={form.formState.isDirty}
            handleDiscard={handleDiscard}
          />
        </div>
      </div>
    </form>
  )
}

export default EditStoreForm
