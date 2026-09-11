import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth/AuthForm'

export const metadata: Metadata = { title: 'Connexion' }

// Errors passed by /auth/callback when an email link can't be used
const LINK_ERRORS: Record<string, string> = {
    lien: 'Ce lien a expiré ou a déjà été utilisé. Connectez-vous, ou demandez un nouveau lien.',
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
    const { erreur } = await searchParams
    return <AuthForm mode="login" initialError={erreur ? LINK_ERRORS[erreur] ?? null : null} />
}
