import { Metadata } from "next"
import { SignInForm } from "./_components/sign-in-form"

export const metadata: Metadata = {
  title: "Account Sign In",
}

const SignInPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ callbackURL: string }>
}) => {
  const { callbackURL } = await searchParams
  return <SignInForm callbackURL={callbackURL} />
}

export default SignInPage
