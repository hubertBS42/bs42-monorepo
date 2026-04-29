"use client"

import { UserWithSessions } from "@/types"
import { authClient } from "@/lib/auth-client"
import ChangePassword from "./change-password"
import ResetPassword from "./reset-password"
import UnbanUser from "./unban-user"
import BanUser from "./ban-user"
import DeleteUser from "./delete-user"
import { SystemRole } from "@bs42/auth"

const UserActions = ({ user }: { user: UserWithSessions }) => {
  const { data, isPending: sessionIsLoading } = authClient.useSession()

  if (sessionIsLoading || !data) return

  const canDelete = authClient.admin.checkRolePermission({
    role: data.user.role as SystemRole,
    permissions: {
      user: ["delete"],
    },
  })

  const isCurrentUser = user.id === data.session.userId

  return (
    <div className="grid gap-y-2">
      {isCurrentUser && <ChangePassword />}
      {!isCurrentUser && (
        <>
          <ResetPassword user={user} />
          {user.banned ? <UnbanUser user={user} /> : <BanUser user={user} />}
          {canDelete && <DeleteUser user={user} />}
        </>
      )}
    </div>
  )
}
export default UserActions
