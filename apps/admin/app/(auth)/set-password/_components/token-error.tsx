import { Button } from "@bs42/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@bs42/ui/components/card"
import Link from "next/link"

const TokenError = () => {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Something went wrong...</CardTitle>
        <CardDescription>
          Invalid or missing token. Please request for a password reset.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <Link href={"/reset-password"}>Reset password</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default TokenError
