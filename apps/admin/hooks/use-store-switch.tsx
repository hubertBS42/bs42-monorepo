import { authClient } from "@/lib/auth-client"
import { useState } from "react"
import { toast } from "@bs42/ui/components/sonner"

type SwitchByIdParams = { storeId: string; storeSlug?: never }
type SwitchBySlugParams = { storeSlug: string; storeId?: never }
type SwitchParams = SwitchByIdParams | SwitchBySlugParams

interface UseStoreSwitcherReturn {
  switchStore: (params: SwitchParams) => Promise<void>
  isSwitching: boolean
}

export function useStoreSwitcher(): UseStoreSwitcherReturn {
  const [isSwitching, setIsSwitching] = useState(false)

  const switchStore = async (params: SwitchParams) => {
    try {
      setIsSwitching(true)
      if ("storeSlug" in params) {
        await authClient.organization.setActive({
          organizationSlug: params.storeSlug,
        })
      } else {
        await authClient.organization.setActive({
          organizationId: params.storeId,
        })
      }

      window.location.href = "/"
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred"
      toast.error("Failed to switch store", { description: message })
      setIsSwitching(false)
    }
  }

  return {
    switchStore,
    isSwitching,
  }
}
