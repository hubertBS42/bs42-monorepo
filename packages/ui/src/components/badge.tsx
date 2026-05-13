import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@bs42/ui/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        // Existing variants (improved dark mode)
        default: "border-transparent bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline: "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost: "border-transparent hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "border-transparent text-primary underline-offset-4 hover:underline",

        // New variants - Status & Feedback
        success:
          "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 [a]:hover:bg-emerald-100 dark:[a]:hover:bg-emerald-950/60",
        warning: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400 [a]:hover:bg-amber-100 dark:[a]:hover:bg-amber-950/60",
        info: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-400 [a]:hover:bg-sky-100 dark:[a]:hover:bg-sky-950/60",

        // Progress states
        pending:
          "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400 [a]:hover:bg-yellow-100 dark:[a]:hover:bg-yellow-950/60",
        processing:
          "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400 [a]:hover:bg-indigo-100 dark:[a]:hover:bg-indigo-950/60",
        completed:
          "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-400 [a]:hover:bg-green-100 dark:[a]:hover:bg-green-950/60",
        cancelled: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400 [a]:hover:bg-red-100 dark:[a]:hover:bg-red-950/60",

        // Role/User state badges (for members)
        superAdmin:
          "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-400 [a]:hover:bg-purple-100 dark:[a]:hover:bg-purple-950/60",
        admin: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400 [a]:hover:bg-blue-100 dark:[a]:hover:bg-blue-950/60",
        user: "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-400 [a]:hover:bg-gray-100 dark:[a]:hover:bg-gray-900/60",
        owner: "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400 [a]:hover:bg-zinc-100 dark:[a]:hover:bg-zinc-900/60",

        // Invitation specific
        invited: "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-400 [a]:hover:bg-teal-100 dark:[a]:hover:bg-teal-950/60",
        expired:
          "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-400 [a]:hover:bg-orange-100 dark:[a]:hover:bg-orange-950/60",

        // Product/Store specific
        featured: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-400 [a]:hover:bg-rose-100 dark:[a]:hover:bg-rose-950/60",
        sale: "border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-800 dark:bg-pink-950/40 dark:text-pink-400 [a]:hover:bg-pink-100 dark:[a]:hover:bg-pink-950/60",
        "out-of-stock": "border-gray-200 bg-gray-100 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 [a]:hover:bg-gray-200 dark:[a]:hover:bg-gray-800/80",

        // Product Condition Badges
        "condition-new":
          "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 [a]:hover:bg-emerald-100 dark:[a]:hover:bg-emerald-950/60",
        "condition-refurbished":
          "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400 [a]:hover:bg-blue-100 dark:[a]:hover:bg-blue-950/60",
        "condition-used-like-new":
          "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-400 [a]:hover:bg-teal-100 dark:[a]:hover:bg-teal-950/60",
        "condition-used-good":
          "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400 [a]:hover:bg-amber-100 dark:[a]:hover:bg-amber-950/60",
        "condition-used-fair":
          "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-400 [a]:hover:bg-orange-100 dark:[a]:hover:bg-orange-950/60",

        // Additional options
        muted: "border-transparent bg-muted text-muted-foreground [a]:hover:bg-muted/80",
      },
      state: {
        default: "",
        pulse: "animate-pulse",
        bounce: "animate-bounce",
        glow: "shadow-lg shadow-current/20 dark:shadow-current/10",
      },
      size: {
        default: "h-5 px-2 text-xs",
        sm: "h-4 px-1.5 text-[10px]",
        lg: "h-6 px-2.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      state: "default",
      size: "default",
    },
  }
)

export interface BadgeProps extends React.ComponentProps<"span">, VariantProps<typeof badgeVariants> {
  asChild?: boolean
}

function Badge({ className, variant, state, size, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot.Root : "span"

  return <Comp data-slot="badge" data-variant={variant} data-state={state} data-size={size} className={cn(badgeVariants({ variant, state, size }), className)} {...props} />
}

export { Badge, badgeVariants }
