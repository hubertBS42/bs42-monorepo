import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@bs42/ui/components/card"
import { Store } from "@/types"
import DeleteStore from "./delete-store"
import LeaveStore from "./leave-store"

interface StoreActionsProps {
  store: Store
  isPlatformStaff: boolean
}

const StoreActions = ({ store, isPlatformStaff }: StoreActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
        <CardDescription>
          {isPlatformStaff
            ? "Permanently delete this store and all its data."
            : "Leave this store."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isPlatformStaff ? <DeleteStore store={store} /> : <LeaveStore />}{" "}
      </CardContent>
    </Card>
  )
}
export default StoreActions
