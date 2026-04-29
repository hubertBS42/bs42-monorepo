import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@bs42/ui/components/sidebar"
import { ReactNode } from "react"

export default function PagesLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col p-4 md:p-6">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
