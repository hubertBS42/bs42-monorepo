import { Button } from "@bs42/ui/components/button"
import { FileQuestion } from "lucide-react"
import Link from "next/link"

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="grid w-full max-w-md gap-6 p-6 text-center">
        <div className="flex justify-center">
          <FileQuestion className="size-16 text-muted-foreground" />
        </div>
        <div className="grid gap-2">
          <h1 className="text-2xl font-bold">Page Not Found</h1>
          <p className="text-sm text-muted-foreground">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
