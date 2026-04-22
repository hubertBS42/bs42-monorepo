import { Inter } from "next/font/google"

import "@bs42/ui/globals.css"
import { cn } from "@bs42/ui/lib/utils"
import { ThemeProvider } from "@bs42/ui/components/theme-provider"
import { TooltipProvider } from "@bs42/ui/components/tooltip"
import { APP_DESCRIPTION, APP_NAME } from "../constants"
import { Toaster } from "@bs42/ui/components/sonner"
import { Metadata } from "next"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: {
    template: `%s - ${APP_NAME}`,
    default: APP_NAME,
  },
  description: APP_DESCRIPTION,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", "font-sans", inter.variable)}
    >
      <body>
        <ThemeProvider attribute={"class"} defaultTheme="system" enableSystem>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
