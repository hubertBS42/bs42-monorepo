import { Check, X } from "lucide-react"
import { cn } from "@bs42/ui/lib/utils"
import { OrderStatusHistoryItem } from "@/types"
import { OrderStatus } from "@bs42/db/enums"
import { format } from "date-fns"
import { capitalizeFirstLetter } from "@bs42/utils"

const STATUS_ORDER: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "COMPLETED"]

const TERMINAL_STATUSES: OrderStatus[] = ["CANCELLED", "REFUNDED"]

const STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  PENDING: "Order has been placed and is awaiting confirmation.",
  CONFIRMED: "Order has been confirmed and payment received.",
  PROCESSING: "Order is being prepared and packed.",
  SHIPPED: "Order has been dispatched for delivery.",
  DELIVERED: "Order has been delivered to the customer.",
  COMPLETED: "Order has been completed successfully.",
  CANCELLED: "Order was cancelled.",
  REFUNDED: "Order has been refunded.",
}

interface OrderTimelineProps {
  currentStatus: OrderStatus
  statusHistory: OrderStatusHistoryItem[]
}

const OrderTimeline = ({ currentStatus, statusHistory }: OrderTimelineProps) => {
  const isTerminal = TERMINAL_STATUSES.includes(currentStatus)

  const getHistoryEntry = (status: OrderStatus) => statusHistory.find((h) => h.status === status)

  const isCompleted = (status: OrderStatus) => !!getHistoryEntry(status)

  const steps = isTerminal ? [...STATUS_ORDER.filter((s) => isCompleted(s)), currentStatus] : STATUS_ORDER

  return (
    <ol className="relative flex flex-col gap-0">
      {steps.map((status, index) => {
        const historyEntry = getHistoryEntry(status)
        const completed = isCompleted(status)
        const isCurrent = status === currentStatus
        const isTerminalStep = TERMINAL_STATUSES.includes(status)
        const isLast = index === steps.length - 1

        return (
          <li key={status} className="relative flex gap-4">
            {/* Left — icon + connector */}
            <div className="flex flex-col items-center">
              {/* Icon */}
              <div
                className={cn(
                  "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-all duration-300",
                  isCurrent && !isTerminalStep && "ring-4 ring-primary/15",
                  isCurrent && isTerminalStep && "ring-4 ring-destructive/15",
                  isTerminalStep
                    ? "text-destructive-foreground border-destructive bg-destructive"
                    : completed
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground opacity-50"
                )}
              >
                {isTerminalStep ? <X className="size-3.5" /> : completed ? <Check className="size-3.5" /> : index + 1}
              </div>

              {/* Connector */}
              {!isLast && (
                <div className="relative mt-1 w-0.5 flex-1 overflow-hidden rounded bg-muted">
                  <div
                    className={cn(
                      "absolute inset-x-0 top-0 transition-all duration-500",
                      isTerminalStep ? "bg-destructive" : completed ? "bg-primary" : "bg-muted",
                      completed ? "h-full" : "h-0"
                    )}
                  />
                </div>
              )}
            </div>

            {/* Right — content */}
            <div className={cn("grid gap-1 pb-8", isLast && "pb-0")}>
              {/* Status title */}
              <p
                className={cn(
                  "text-sm leading-8 font-medium transition-colors",
                  isCurrent && isTerminalStep && "text-destructive",
                  isCurrent && !isTerminalStep && "text-primary",
                  completed && !isCurrent && "text-foreground",
                  !completed && "text-muted-foreground"
                )}
              >
                {capitalizeFirstLetter(status)}
              </p>

              {/* Description */}
              <p className={cn("text-xs", completed || isCurrent ? "text-muted-foreground" : "text-muted-foreground/50")}>{STATUS_DESCRIPTIONS[status]}</p>

              {/* Timestamp + changed by */}
              {historyEntry && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <p className="text-xs text-muted-foreground">{format(historyEntry.createdAt, "MMM d, yyyy, h:mm a")}</p>
                  {historyEntry.changedBy && (
                    <>
                      <span className="text-xs text-muted-foreground">·</span>
                      <p className="text-xs text-muted-foreground">{historyEntry.changedBy.name}</p>
                    </>
                  )}
                </div>
              )}

              {/* Note */}
              {historyEntry?.note && <p className="mt-1 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">{historyEntry.note}</p>}

              {/* Upcoming placeholder */}
              {!completed && !isTerminalStep && <p className="text-xs text-muted-foreground">Pending...</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export default OrderTimeline
