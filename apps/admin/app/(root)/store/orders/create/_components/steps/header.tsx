import { Check } from "lucide-react"
import { cn } from "@bs42/ui/lib/utils"
import { Step } from "@bs42/types"

interface HeaderProps {
  steps: Step[]
  onStepClick?: (step: Step) => void
}

export default function Header({ steps, onStepClick }: HeaderProps) {
  return (
    <nav aria-label="Form progress" className="mx-auto w-full">
      <ol className="flex items-start">
        {steps.map((step, index) => {
          const isCompleted = step.status === "completed"

          const isCurrent = step.status === "current"

          const isUpcoming = step.status === "upcoming"

          const isClickable = isCompleted || isCurrent

          return (
            <li key={step.id} className={cn("relative flex flex-1", index === steps.length - 1 && "flex-initial")}>
              {/* Step */}
              <div className="relative z-10 flex flex-col items-center">
                <button
                  type="button"
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={step.title}
                  disabled={!isClickable}
                  onClick={() => onStepClick?.(step)}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full border text-sm font-medium transition-all duration-300",
                    "focus:ring-2 focus:ring-primary/30 focus:outline-none",

                    // Completed
                    isCompleted && "border-primary bg-primary text-primary-foreground",

                    // Current
                    isCurrent && "border-primary bg-primary text-primary-foreground ring-4 ring-primary/15",

                    // Upcoming
                    isUpcoming && "border-border bg-background text-muted-foreground",

                    // Interactive
                    isClickable && "cursor-pointer hover:scale-105",

                    // Disabled
                    !isClickable && "cursor-not-allowed opacity-60"
                  )}
                >
                  {isCompleted ? <Check className="size-4" /> : index + 1}
                </button>

                {/* Labels */}
                <div className="mt-3 text-center">
                  <p
                    className={cn(
                      "text-sm font-medium transition-colors",

                      isCurrent && "text-primary",

                      isCompleted && "text-foreground",

                      isUpcoming && "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </p>

                  {step.description && <p className="mt-1 hidden text-xs text-muted-foreground sm:block">{step.description}</p>}
                </div>
              </div>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="relative mt-4 h-0.5 flex-1 overflow-hidden rounded bg-muted">
                  <div className={cn("absolute inset-y-0 left-0 bg-primary transition-all duration-500", isCompleted ? "w-full" : "w-0")} />
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
