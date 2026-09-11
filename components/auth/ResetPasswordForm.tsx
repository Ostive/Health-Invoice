'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button, Spinner } from '@/components/ui/button'
import { buttonClass } from '@/components/ui/button-styles'
import { Field, Input } from '@/components/ui/input'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/cn'
import { errorMessage } from '@/lib/errors'
import { PasswordInput, PasswordChecklist, missingPasswordRules } from './PasswordField'
import { translateAuthError } from './errors'

type Status = 'checking' | 'ready' | 'expired' | 'done'

export function ResetPasswordForm() {
    const [status, setStatus] = useState<Status>('checking')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // The reset link opens a session (via /auth/callback); without one the link has expired
    useEffect(() => {
        let cancelled = false
        createClient().auth.getUser().then(({ data }) => {
            if (!cancelled) setStatus(data.user ? 'ready' : 'expired')
        })
        return () => { cancelled = true }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        const missing = missingPasswordRules(password)
        if (missing.length > 0) {
            setError(`Le mot de passe doit contenir : ${missing.join(', ')}.`)
            return
        }
        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.')
            return
        }

        setIsLoading(true)
        try {
            const { error } = await createClient().auth.updateUser({ password })
            if (error) throw error
            setStatus('done')
            setTimeout(() => window.location.assign('/dashboard'), 1500)
        } catch (err) {
            setError(translateAuthError(errorMessage(err)).text)
            setIsLoading(false)
        }
    }

    if (status === 'checking') {
        return (
            <p role="status" className="flex items-center justify-center gap-3 py-10 text-sm text-ink-soft">
                <Spinner />Vérification du lien…
            </p>
        )
    }

    if (status === 'expired') {
        return (
            <div>
                <span className="grid size-12 place-items-center rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                    <Icon name="clock" className="size-6" />
                </span>
                <h1 className="mt-6 font-display text-[1.75rem] font-semibold leading-tight text-ink">Ce lien a expiré</h1>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                    Les liens de réinitialisation ne servent qu’une fois et pendant une durée limitée. Demandez-en un nouveau.
                </p>
                <div className="mt-8 flex flex-col gap-2">
                    <Link href="/mot-de-passe-oublie" className={buttonClass({ size: 'lg' })}>Demander un nouveau lien</Link>
                    <Link href="/connexion" className={buttonClass({ variant: 'ghost', size: 'lg' })}>Retour à la connexion</Link>
                </div>
            </div>
        )
    }

    if (status === 'done') {
        return (
            <div role="status">
                <span className="grid size-12 place-items-center rounded-full bg-vitale-50 text-vitale-600 ring-1 ring-vitale-100">
                    <Icon name="check" className="size-6" strokeWidth={2.25} />
                </span>
                <h1 className="mt-6 font-display text-[1.75rem] font-semibold leading-tight text-ink">Mot de passe modifié</h1>
                <p className="mt-3 text-[15px] text-ink-soft">Ouverture de votre espace…</p>
            </div>
        )
    }

    const passwordsMatch = password === confirmPassword

    return (
        <div>
            <h1 className="font-display text-[1.75rem] font-semibold leading-tight text-ink">Nouveau mot de passe</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">Choisissez le mot de passe que vous utiliserez désormais pour vous connecter.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <Field label="Nouveau mot de passe" htmlFor="new-password">
                    <PasswordInput
                        id="new-password"
                        name="new-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        autoFocus
                        disabled={isLoading}
                        visible={showPassword}
                        onToggleVisible={() => setShowPassword(v => !v)}
                    />
                    <PasswordChecklist password={password} />
                </Field>

                <Field label="Confirmer le mot de passe" htmlFor="confirm-new-password">
                    <Input
                        id="confirm-new-password"
                        name="confirm-new-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        disabled={isLoading}
                        aria-invalid={confirmPassword.length > 0 && !passwordsMatch}
                    />
                    {confirmPassword.length > 0 && (
                        <p className={cn('mt-1.5 flex items-center gap-1.5 text-xs', passwordsMatch ? 'text-vitale-700' : 'text-ink-faint')}>
                            <Icon name={passwordsMatch ? 'check' : 'close'} className="size-3.5" strokeWidth={2.5} />
                            {passwordsMatch ? 'Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas encore'}
                        </p>
                    )}
                </Field>

                {error && (
                    <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800">{error}</p>
                )}

                <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
                    Enregistrer le mot de passe
                </Button>
            </form>
        </div>
    )
}
