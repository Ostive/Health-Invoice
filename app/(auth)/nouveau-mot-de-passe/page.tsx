import type { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export const metadata: Metadata = {
    title: 'Nouveau mot de passe',
    robots: { index: false },
}

export default function ResetPasswordPage() {
    return <ResetPasswordForm />
}
