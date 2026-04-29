import { Metadata } from 'next'
import { SetPasswordForm } from './_components/set-password-form'
import TokenError from './_components/token-error'

export const metadata: Metadata = {
	title: 'Set A New Password',
}
const SetPasswordPage = async ({ searchParams }: { searchParams: Promise<{ token: string; action: string }> }) => {
	const { token, action } = await searchParams
	if (!token) return <TokenError />
	return (
		<SetPasswordForm
			action={action}
			token={token}
		/>
	)
}

export default SetPasswordPage
