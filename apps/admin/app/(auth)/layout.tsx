import { APP_LOGO, APP_NAME } from "@/constants"
import { ReactNode } from "react"
import Image from "next/image"

export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Image
          src={APP_LOGO.static}
          alt={APP_NAME}
          className="mx-auto w-30"
          priority
        />
        {children}
      </div>
    </div>
  )
}
