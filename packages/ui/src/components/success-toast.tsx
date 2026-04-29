'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

const SuccessToast = ({ message }: { message: string }) => {
	useEffect(() => {
		toast.success(message)
		// Clean up the search param from the URL
		window.history.replaceState({}, '', window.location.pathname)
	}, [message])

	return null
}

export default SuccessToast
