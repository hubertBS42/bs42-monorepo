"use client"

import { Address } from "@bs42/db/client"
import AddressCard from "./address-card"

const Addresses = ({ addresses }: { addresses: Address[] }) => {
  return (
    <div>
      {addresses.length > 0 ? (
        addresses.map((address) => <AddressCard key={address.id} address={address} />)
      ) : (
        <span className="flex justify-center text-sm">No saved addresses</span>
      )}
    </div>
  )
}
export default Addresses
