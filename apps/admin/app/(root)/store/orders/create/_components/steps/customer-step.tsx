"use client"

import { useState, useTransition } from "react"
import { UseFormReturn } from "react-hook-form"
import { z } from "zod"
import { createOrderFormSchema } from "@/lib/zod"
import { Button } from "@bs42/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@bs42/ui/components/card"
import { FieldGroup } from "@bs42/ui/components/field"
import InputField from "@bs42/ui/components/input-field"
import { Input } from "@bs42/ui/components/input"
import { Search, ChevronLeft, ChevronRight, UserCheck } from "lucide-react"
import { Badge } from "@bs42/ui/components/badge"
import { UserSearchResult } from "@/types"
import { DataResponse } from "@bs42/types"
import PhoneField from "@bs42/ui/components/phone-field"

type FormValues = z.infer<typeof createOrderFormSchema>

interface CustomerStepProps {
  form: UseFormReturn<FormValues>
  onBack: () => void
  onNext: () => void
}

const CustomerStep = ({ form, onBack, onNext }: CustomerStepProps) => {
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState("")
  const [results, setResults] = useState<UserSearchResult[]>([])
  const [linkedUser, setLinkedUser] = useState<UserSearchResult | null>(() => {
    const userId = form.getValues("userId")
    const customerName = form.getValues("customerName")
    const customerEmail = form.getValues("customerEmail")
    const customerPhone = form.getValues("customerPhone")

    if (userId && customerName && customerEmail) {
      return {
        id: userId,
        name: customerName,
        email: customerEmail,
        phone: customerPhone ?? null,
      }
    }

    return null
  })

  const handleSearch = () => {
    if (!search.trim()) return
    startTransition(async () => {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(search)}`)
      const result: DataResponse<UserSearchResult[]> = await response.json()

      if (!result.success) {
        throw new Error(result.error)
      } else {
        setResults(result.data)
      }
    })
  }

  const handleSelectUser = async (user: UserSearchResult) => {
    setLinkedUser(user)
    form.setValue("userId", user.id)
    form.setValue("customerName", user.name)
    form.setValue("customerEmail", user.email)
    form.setValue("customerPhone", user.phone ?? "")
    await form.trigger(["customerName", "customerEmail", "customerPhone"])
    setResults([])
    setSearch("")
  }

  const handleClearUser = () => {
    setLinkedUser(null)
    form.setValue("userId", null)
    form.setValue("customerName", "")
    form.setValue("customerEmail", "")
    form.setValue("customerPhone", "")
    // Reset shipping fields too
    form.setValue("shippingName", "")
    form.setValue("shippingPhone", "")
    form.setValue("shippingLine1", "")
    form.setValue("shippingLine2", "")
    form.setValue("shippingRegion", "")
    form.setValue("shippingTown", "")
    form.setValue("shippingLat", null)
    form.setValue("shippingLng", null)
  }

  const handleNext = async () => {
    const valid = await form.trigger(["customerName", "customerEmail", "customerPhone"])
    if (valid) onNext()
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Details</CardTitle>
          <CardDescription>Search for an existing customer or enter details manually.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {/* Customer search */}
          <div className="grid gap-2">
            <p className="text-sm font-medium">Search Existing Customer</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9"
                />
              </div>
              <Button type="button" variant="outline" onClick={handleSearch} disabled={isPending}>
                Search
              </Button>
            </div>

            {/* Search results */}
            {results.length > 0 && (
              <div className="grid gap-1 rounded-md border">
                {results.map((user) => (
                  <button key={user.id} type="button" className="flex items-center justify-between px-3 py-2 text-left hover:bg-accent" onClick={() => handleSelectUser(user)}>
                    <div className="grid gap-0.5">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    {user.phone && <p className="text-xs text-muted-foreground">{user.phone}</p>}
                  </button>
                ))}
              </div>
            )}

            {/* Linked user badge */}
            {linkedUser && (
              <div className="flex items-center gap-2 rounded-md border p-3">
                <UserCheck className="size-4 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{linkedUser.name}</p>
                  <p className="text-xs text-muted-foreground">{linkedUser.email}</p>
                </div>
                <Badge variant="secondary">Linked</Badge>
                <Button type="button" variant="ghost" size="sm" onClick={handleClearUser}>
                  Unlink
                </Button>
              </div>
            )}
          </div>

          {/* Manual entry */}
          <FieldGroup>
            <InputField control={form.control} name="customerName" label="Full Name" placeholder="John Doe" disabled={isPending} />
            <div className="grid gap-5 sm:grid-cols-2">
              <InputField control={form.control} name="customerEmail" label="Email" type="email" placeholder="john@example.com" disabled={isPending} />
              <PhoneField control={form.control} name="customerPhone" label="Phone (optional)" disabled={isPending} defaultCountry="GH" />
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 size-4" />
          Back to Items
        </Button>
        <Button type="button" onClick={handleNext}>
          Continue to Shipping
          <ChevronRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  )
}

export default CustomerStep
