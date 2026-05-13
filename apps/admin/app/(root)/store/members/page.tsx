import { Metadata } from "next"
import { MembersFilters } from "@/types"
import { getStoreMembers } from "@/lib/data/members.data"
import MembersTable from "./_components/members-table"

export const metadata: Metadata = {
  title: "Store Members",
}

type StoreMembersPageProps = {
  searchParams: Promise<{
    name?: string
    page?: string
    pageSize?: string
    sort?: string
    order?: string
  }>
}

const StoreMembersPage = async ({ searchParams }: StoreMembersPageProps) => {
  const params = await searchParams

  const filters: MembersFilters = {
    name: params.name,
    page: params.page ? parseInt(params.page) : 1,
    pageSize: params.pageSize ? parseInt(params.pageSize) : 10,
    sort: params.sort,
    order: params.order as "asc" | "desc" | undefined,
  }

  const result = await getStoreMembers(filters)
  if (!result.success) throw new Error(result.error)

  return (
    <main className="flex flex-col gap-y-6">
      <div className="grid">
        <h2 className="text-xl font-bold md:text-2xl">Manage Members</h2>
        <p className="text-sm text-muted-foreground">View and manage this store&apos;s members.</p>
      </div>
      <MembersTable data={result.data} />
    </main>
  )
}

export default StoreMembersPage
