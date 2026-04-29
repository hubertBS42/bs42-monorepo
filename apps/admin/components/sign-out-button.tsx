"use client"

import { Button } from "@bs42/ui/components/button"
import { authClient } from "@/lib/auth-client"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Spinner } from "@bs42/ui/components/spinner"
import { toast } from "@bs42/ui/components/sonner"

interface SignOutButtonProps {
  variant?:
    | "default"
    | "outline"
    | "ghost"
    | "destructive"
    | "secondary"
    | "link"
  className?: string
}

const SignOutButton = ({
  variant = "outline",
  className,
}: SignOutButtonProps) => {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSignOut = () => {
    startTransition(async () => {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/sign-in")
          },
          onError: (ctx) => {
            toast.error("Failed to sign out", {
              description: ctx.error.message,
            })
          },
        },
      })
    })
  }

  return (
    <Button
      variant={variant}
      className={className}
      onClick={handleSignOut}
      disabled={isPending}
    >
      {isPending ? <Spinner /> : <LogOut className="size-4" />}
      {isPending ? "Signing Out..." : "Sign Out"}
    </Button>
  )
}

export default SignOutButton
