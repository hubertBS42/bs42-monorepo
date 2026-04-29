import { Metadata } from 'next'
import { ResetPasswordForm } from './_components/reset-password-form'

export const metadata: Metadata = {
	title: 'Reset Your Password',
}

const ResetPasswordPage = () => {
	return <ResetPasswordForm />
}

export default ResetPasswordPage
