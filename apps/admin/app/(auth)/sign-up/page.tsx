import { Metadata } from "next"
import { SignUpForm } from "./_components/sign-up-form"
import { prisma } from "@bs42/db"

export const metadata: Metadata = {
  title: "Create An Account",
}

interface SignUpPageProps {
  searchParams: Promise<{ callbackURL?: string }>
}

const SignUpPage = async ({ searchParams }: SignUpPageProps) => {
  const { callbackURL } = await searchParams

  // Extract invitationId from callbackURL
  let invitedEmail: string | undefined

  if (callbackURL?.startsWith("/accept-invitation/")) {
    const invitationId = callbackURL.split("/").pop()

    if (invitationId) {
      const invitation = await prisma.invitation.findUnique({
        where: { id: invitationId },
        select: { email: true },
      })
      invitedEmail = invitation?.email
    }
  }

  return <SignUpForm callbackURL={callbackURL ?? "/"} email={invitedEmail} />
}
export default SignUpPage
