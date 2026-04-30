import { auth } from "@/lib/auth"
import { prisma } from "@bs42/db"
import { Metadata } from "next"
import { headers } from "next/headers"

export const metadata: Metadata = {
  title: "Dashboard",
}
const Dashboard = async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  const activeOrganizationId = session?.session.activeOrganizationId

  const activeOrg = activeOrganizationId
    ? await prisma.organization.findUnique({
        where: { id: activeOrganizationId },
        select: { slug: true },
      })
    : null

  const isGlobal = activeOrg?.slug === "global"
  return (
    <div className="grid gap-4 md:gap-6">
      <div className="grid">
        <h1 className="text-xl font-bold md:text-2xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {isGlobal
            ? "Platform overview across all stores."
            : "Overview of your store's resources."}
        </p>
      </div>
      {/* <Suspense fallback={<SectionCardsSkeleton />}>{isGlobal ? <GlobalSectionCards /> : <OrgSectionCards />}</Suspense>

			<div className='grid lg:grid-cols-3 gap-4'>
				<div className='lg:col-span-2'>
					<Suspense fallback={<RecordingsChartSkeleton />}>
						{isGlobal ? <GlobalRecordingsChart data={globalRecordingsData} /> : <OrgRecordingsChart data={orgRecordingsData} />}
					</Suspense>
				</div>
				<Suspense fallback={<RecentActivitiesSkeleton />}>
					<RecentActivities />
				</Suspense>
			</div> */}
    </div>
  )
}
export default Dashboard
