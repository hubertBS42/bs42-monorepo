"use client"

import { Member, Organization } from "@bs42/db/client"
import { useStoreSwitcher } from "@/hooks/use-store-switch"
import { ShieldX } from "lucide-react"
import { Button } from "@bs42/ui/components/button"
import SignOutButton from "@/components/sign-out-button"

type MemberWithOrganization = Member & { organization: Organization }

const RemovedFromStore = ({
  memberships,
}: {
  memberships: MemberWithOrganization[]
}) => {
  const { switchStore, isSwitching } = useStoreSwitcher()

  const hasOtherOrgs = memberships.length > 0

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="grid w-full max-w-md gap-6 p-6 text-center">
        <div className="flex justify-center">
          <ShieldX className="size-16 text-destructive" />
        </div>
        <div className="grid gap-2">
          <h1 className="text-2xl font-bold">Removed From Store</h1>
          <p className="text-sm text-muted-foreground">
            You have been removed from this store.
            {hasOtherOrgs
              ? " You can switch to another store or sign out."
              : " You no longer have access to any stores."}
          </p>
        </div>

        {hasOtherOrgs && (
          <div className="grid gap-2">
            <p className="text-sm font-medium">Switch to another store:</p>
            {memberships.map((membership) => (
              <Button
                key={membership.id}
                variant="outline"
                disabled={isSwitching}
                onClick={() =>
                  switchStore({
                    storeId: membership.organizationId,
                  })
                }
              >
                {membership.organization.name}
              </Button>
            ))}
          </div>
        )}

        <SignOutButton variant="outline" />
      </div>
    </div>
  )
}

export default RemovedFromStore
