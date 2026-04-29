import { Spinner } from "@bs42/ui/components/spinner"

const Loader = () => {
  return (
    <div className="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center">
      <Spinner className="size-6" />
    </div>
  )
}

export default Loader
