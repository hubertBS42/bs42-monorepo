"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { createOrderAction } from "@/lib/actions/order.actions"
import { createOrderFormSchema } from "@/lib/zod"
import { toast } from "@bs42/ui/components/sonner"
import { Step } from "@bs42/types"
import Header from "./steps/header"
import ItemsStep from "./steps/items-step"
import CustomerStep from "./steps/customer-step"
import ShippingStep from "./steps/shipping-step"
import ReviewStep from "./steps/review-step"

type CreateOrderFormProps = {
  organizationId: string
  exchangeRate: number
}

const INITIAL_STEPS: Step[] = [
  {
    id: "items",
    title: "Items",
    description: "Select products",
    status: "current",
  },
  {
    id: "customer",
    title: "Customer",
    description: "Customer information",
    status: "upcoming",
  },
  {
    id: "shipping",
    title: "Shipping",
    description: "Shipping details",
    status: "upcoming",
  },
  {
    id: "review",
    title: "Review",
    description: "Review and submit",
    status: "upcoming",
  },
]

export default function CreateOrderForm({ organizationId, exchangeRate }: CreateOrderFormProps) {
  const router = useRouter()

  const [isPending, startTransition] = useTransition()

  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS)

  const currentStep = steps.find((step) => step.status === "current")

  const form = useForm<z.infer<typeof createOrderFormSchema>>({
    resolver: zodResolver(createOrderFormSchema),
    defaultValues: {
      items: [],
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      userId: null,
      shippingMethod: "delivery",
      shippingName: "",
      shippingPhone: "",
      shippingLine1: "",
      shippingLine2: "",
      shippingRegion: "",
      shippingTown: "",
      shippingPrice: 0,
      taxPrice: 0,
      applyDiscount: false,
      discountType: null,
      discountValue: null,
      discountReason: "",
      notes: "",
    },
    // mode: "onChange",
  })

  const onSubmit: SubmitHandler<z.infer<typeof createOrderFormSchema>> = async (data) => {
    startTransition(async () => {
      const response = await createOrderAction(data)

      if (!response.success) {
        toast.error("Failed to create order", {
          description: response.error,
        })

        return
      }

      toast.success("Order created successfully.")

      router.push("/store/orders")
    })
  }

  const goToStep = (stepId: string, markCurrentAs: "completed" | "upcoming" = "completed") => {
    setSteps((prev) =>
      prev.map((step) => ({
        ...step,
        status: step.id === stepId ? "current" : step.status === "current" ? markCurrentAs : step.status,
      }))
    )
  }
  const completeStep = (currentId: string, nextId: string) => {
    setSteps((prev) =>
      prev.map((step) => {
        if (step.id === currentId) return { ...step, status: "completed" }
        if (step.id === nextId) return { ...step, status: "current" }
        return step
      })
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Header */}
      <Header steps={steps} onStepClick={(step) => goToStep(step.id)} />

      {/* Step Content */}
      {currentStep?.id === "items" && <ItemsStep form={form} exchangeRate={exchangeRate} organizationId={organizationId} onNext={() => completeStep("items", "customer")} />}

      {currentStep?.id === "customer" && <CustomerStep form={form} onBack={() => goToStep("items", "upcoming")} onNext={() => completeStep("customer", "shipping")} />}

      {currentStep?.id === "shipping" && (
        <ShippingStep form={form} onBack={() => goToStep("customer", "upcoming")} onNext={() => completeStep("shipping", "review")} exchangeRate={exchangeRate} />
      )}

      {currentStep?.id === "review" && <ReviewStep form={form} exchangeRate={exchangeRate} isPending={isPending} onBack={() => goToStep("shipping", "upcoming")} />}
    </form>
  )
}
