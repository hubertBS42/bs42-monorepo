"use client"

import { Button } from "@bs42/ui/components/button"
import { AlertTriangle } from "lucide-react"
import { useEffect } from "react"

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

const ErrorPage = ({ error, reset }: ErrorPageProps) => {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="grid w-full max-w-md gap-6 p-6 text-center">
        <div className="flex justify-center">
          <AlertTriangle className="size-16 text-destructive" />
        </div>
        <div className="grid gap-2">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred. Please try again or contact support if
            the problem persists.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground">
              Error ID: <span className="font-mono">{error.digest}</span>
            </p>
          )}
        </div>
        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
          >
            Go Home
          </Button>
          <Button onClick={reset}>Try Again</Button>
        </div>
      </div>
    </div>
  )
}

export default ErrorPage
