"use client"

import { ChevronLeft } from "lucide-react"
import { Button } from "@bs42/ui/components/button"
import Link from "next/link"

const BackButton = ({
  isLoading,
  link,
}: {
  isLoading?: boolean
  link: string
}) => {
  return (
    <Button variant={"outline"} size={"sm"} disabled={isLoading} asChild>
      <Link href={link}>
        <ChevronLeft className="size-4" /> Back
      </Link>
    </Button>
  )
}

export default BackButton
