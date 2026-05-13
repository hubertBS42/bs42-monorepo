"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@bs42/ui/components/card"
import { Store } from "@/types"
import dynamic from "next/dynamic"
import ButtonSkeleton from "@bs42/ui/components/button-skeleton"

interface StoreActionsProps {
  store: Store
  isPlatformStaff: boolean
}

const DeleteStore = dynamic(() => import("./delete-store"), {
  ssr: false,
  loading: () => <ButtonSkeleton />,
})

const LeaveStore = dynamic(() => import("./leave-store"), {
  ssr: false,
  loading: () => <ButtonSkeleton />,
})

const StoreActions = ({ store, isPlatformStaff }: StoreActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
        <CardDescription>{isPlatformStaff ? "Permanently delete this store and all its data." : "Leave this store."}</CardDescription>
      </CardHeader>
      <CardContent>{isPlatformStaff ? <DeleteStore store={store} /> : <LeaveStore />}</CardContent>
    </Card>
  )
}
export default StoreActions
