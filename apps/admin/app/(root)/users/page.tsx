import { Metadata } from "next"
import UsersTable from "./_components/users-table"
import { getAllUsers } from "@/lib/data/users.data"
import AddButton from "@/components/add-button"
import { UsersFilters } from "@/types"

export const metadata: Metadata = {
  title: "Manage Users",
}
interface UsersPageProps {
  searchParams: Promise<{
    name?: string
    pageSize?: string
    page?: string
    sort?: string
    order?: string
  }>
}
const UsersPage = async ({ searchParams }: UsersPageProps) => {
  const params = await searchParams

  const filters: UsersFilters = {
    name: params.name,
    page: params.page ? parseInt(params.page) : 1,
    pageSize: params.pageSize ? parseInt(params.pageSize) : 10,
    sort: params.sort,
    order: params.order as "asc" | "desc" | undefined,
  }

  const result = await getAllUsers(filters)
  if (!result.success) throw new Error(result.error)
  return (
    <main className="flex flex-col gap-y-6">
      <div className="flex items-end justify-between">
        <div className="grid">
          <h1 className="text-xl font-bold md:text-2xl">Manage Users</h1>
          <p className="text-sm text-muted-foreground">View and manage all users.</p>
        </div>

        <AddButton label="Add User" url="/users/add" />
      </div>
      <UsersTable data={result.data} />
    </main>
  )
}

export default UsersPage
