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
import { Field, FieldGroup, FieldLabel } from "@bs42/ui/components/field"
import { STORE_PLAN_OPTIONS, STORE_STATUS_OPTIONS } from "@/constants"
import { authClient } from "@/lib/auth-client"
import { addStoreFormSchema } from "@/lib/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"
import slugify from "slugify"
import { toast } from "@bs42/ui/components/sonner"
import { Checkbox } from "@bs42/ui/components/checkbox"
import ResourceFormHeader from "@/components/resource-form-header"
import ResourceFormFooter from "@/components/resource-form-footer"
import { useEffect, useState, useTransition } from "react"
import { StorePlan, StoreStatus } from "@/types"

const AddOrganizationForm = () => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [autoGenSlug, setAutoGenSlug] = useState(true)

  const form = useForm<z.infer<typeof addStoreFormSchema>>({
    resolver: zodResolver(addStoreFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      logo: "",
      plan: StorePlan.BASIC,
      status: StoreStatus.ACTIVE,
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
    form.setValue("slug", slugified, { shouldDirty: false }) // keep dirty state clean
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

  const onSubmit: SubmitHandler<z.infer<typeof addStoreFormSchema>> = async (
    storeData
  ) => {
    startTransition(async () => {
      const { error: checkSlugError } = await authClient.organization.checkSlug(
        {
          slug: storeData.slug,
        }
      )

      if (checkSlugError) {
        return form.setError("slug", {
          type: "custom",
          message: checkSlugError.message,
        })
      }

      const { error: createOrgErr } = await authClient.organization.create({
        name: storeData.name,
        slug: storeData.slug,
        logo: !storeData.logo ? undefined : storeData.logo,
        plan: storeData.plan,
        status: storeData.status,
        keepCurrentActiveOrganization: true,
      })

      if (createOrgErr) {
        toast.error("Operation failed", { description: createOrgErr.message })
      } else {
        router.push("/stores")
        toast.success("Store created successfully.")
      }
    })
  }

  const handleDiscard = async () => {
    router.push("/stores")
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-y-6">
        <ResourceFormHeader
          heading="Add Store"
          description="Create a new store to manage members and products."
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
                    Configure the basic information and settings for your store.
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

export default AddOrganizationForm
