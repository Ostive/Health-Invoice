'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button, buttonClass } from '@/components/ui/button'
import { Field, Input } from '@/components/ui/input'
import { Icon } from '@/components/ui/icon'
import { Legal, LegalPageType } from '@/components/Legal'
import { cn } from '@/lib/cn'
import { errorMessage } from '@/lib/errors'
import { PasswordInput, PasswordChecklist, missingPasswordRules } from './PasswordField'
import { AuthError, translateAuthError } from './errors'

export type AuthMode = 'login' | 'register' | 'forgot'

const COPY: Record<AuthMode, { title: string; subtitle: string; submit: string }> = {
    login: {
        title: 'Connexion',
        subtitle: 'Retrouvez vos factures et vos patients.',
        submit: 'Se connecter',
    },
    register: {
        title: 'Créer votre compte',
        subtitle: 'Gratuit et sans carte bancaire. Votre première facture en deux minutes.',
        submit: 'Créer mon compte',
    },
    forgot: {
        title: 'Mot de passe oublié',
        subtitle: 'Indiquez l’email de votre compte : nous vous envoyons un lien pour choisir un nouveau mot de passe.',
        submit: 'Recevoir le lien',
    },
}

// Kept in sessionStorage (never in the URL) so the email follows the user between login, signup and reset
const EMAIL_STORAGE_KEY = 'fs-auth-email'
const RESEND_COOLDOWN_S = 30

const alertClass = 'rounded-lg border px-3.5 py-3 text-sm animate-in fade-in duration-200'

export function AuthForm({ mode, initialError = null }: { mode: AuthMode; initialError?: string | null }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<AuthError | null>(initialError ? { text: initialError, kind: 'generic' } : null)
    const [notice, setNotice] = useState<string | null>(null)
    const [sentTo, setSentTo] = useState<string | null>(null)
    const [resendIn, setResendIn] = useState(0)
    const [legal, setLegal] = useState<LegalPageType | null>(null)

    useEffect(() => {
        try {
            const saved = sessionStorage.getItem(EMAIL_STORAGE_KEY)
            if (saved) setEmail(saved)
        } catch {
            // Storage unavailable (private mode): the field simply starts empty
        }
    }, [])

    useEffect(() => {
        if (resendIn <= 0) return
        const timer = setTimeout(() => setResendIn(s => s - 1), 1000)
        return () => clearTimeout(timer)
    }, [resendIn])

    const updateEmail = (value: string) => {
        setEmail(value)
        try {
            sessionStorage.setItem(EMAIL_STORAGE_KEY, value)
        } catch {
            // ignore
        }
    }

    /** Sends the reset link (forgot) or a new signup confirmation (register / unconfirmed login) */
    const sendLink = async (target: string) => {
        const supabase = createClient()
        const origin = window.location.origin
        const { error } = mode === 'forgot'
            ? await supabase.auth.resetPasswordForEmail(target, { redirectTo: `${origin}/auth/callback?next=/nouveau-mot-de-passe` })
            : await supabase.auth.resend({ type: 'signup', email: target, options: { emailRedirectTo: `${origin}/auth/callback` } })
        if (error) throw error
        setResendIn(RESEND_COOLDOWN_S)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setNotice(null)
        const cleanEmail = email.trim()
        let redirecting = false

        try {
            if (mode === 'login') {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: cleanEmail, password }),
                })
                const data = await response.json().catch(() => ({}))
                if (!response.ok) throw new Error(data.error || 'Login failed')
                redirecting = true
                window.location.assign('/dashboard')
            } else if (mode === 'register') {
                if (password !== confirmPassword) throw new Error('Les mots de passe ne correspondent pas.')
                const missing = missingPasswordRules(password)
                if (missing.length > 0) throw new Error(`Le mot de passe doit contenir : ${missing.join(', ')}.`)

                const response = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: cleanEmail, password }),
                })
                const data = await response.json().catch(() => ({}))
                if (!response.ok) throw new Error(data.error || 'Registration failed')

                if (data.session) {
                    redirecting = true
                    window.location.assign('/dashboard')
                } else {
                    setSentTo(cleanEmail)
                    setResendIn(RESEND_COOLDOWN_S)
                }
            } else {
                await sendLink(cleanEmail)
                setSentTo(cleanEmail)
            }
        } catch (err) {
            setError(translateAuthError(errorMessage(err)))
        } finally {
            if (!redirecting) setIsLoading(false)
        }
    }

    const resend = async (target: string) => {
        if (resendIn > 0) return
        setError(null)
        setNotice(null)
        try {
            await sendLink(target)
            setNotice(mode === 'login' ? 'Email de confirmation renvoyé. Vérifiez votre boîte de réception.' : 'Un nouvel email vient de partir.')
        } catch (err) {
            setError(translateAuthError(errorMessage(err)))
        }
    }

    const copy = COPY[mode]
    const passwordsMatch = password === confirmPassword

    if (sentTo) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                <span className="grid size-12 place-items-center rounded-full bg-primary-50 text-primary-600 ring-1 ring-primary-100">
                    <Icon name="mail" className="size-6" />
                </span>
                <h1 className="mt-6 font-display text-[1.75rem] font-semibold leading-tight text-ink">Vérifiez votre boîte mail</h1>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                    {mode === 'forgot' ? (
                        <>Si un compte existe pour <strong className="font-medium text-ink">{sentTo}</strong>, un lien pour choisir un nouveau mot de passe vient de partir.</>
                    ) : (
                        <>Nous avons envoyé un lien de confirmation à <strong className="font-medium text-ink">{sentTo}</strong>. Cliquez dessus pour activer votre compte.</>
                    )}
                </p>
                <p className="mt-3 text-sm text-ink-faint">Rien reçu ? Vérifiez vos courriers indésirables.</p>

                {notice && <p role="status" className={cn(alertClass, 'mt-6 border-vitale-100 bg-vitale-50 text-vitale-700')}>{notice}</p>}
                {error && <p role="alert" className={cn(alertClass, 'mt-6 border-red-200 bg-red-50 text-red-800')}>{error.text}</p>}

                <div className="mt-8 flex flex-col gap-2">
                    <Button variant="outline" size="lg" onClick={() => resend(sentTo)} disabled={resendIn > 0}>
                        {resendIn > 0 ? `Renvoyer l’email (${resendIn} s)` : 'Renvoyer l’email'}
                    </Button>
                    <Link href="/connexion" className={buttonClass({ variant: 'ghost', size: 'lg' })}>Retour à la connexion</Link>
                </div>
            </div>
        )
    }

    return (
        <div>
            <h1 className="font-display text-[1.75rem] font-semibold leading-tight text-ink">{copy.title}</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{copy.subtitle}</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <Field label="Email professionnel" htmlFor="auth-email">
                    <Input
                        id="auth-email"
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => updateEmail(e.target.value)}
                        placeholder="nom@cabinet.fr"
                        autoComplete="email"
                        autoFocus
                        disabled={isLoading}
                    />
                </Field>

                {mode !== 'forgot' && (
                    <Field
                        label="Mot de passe"
                        htmlFor="auth-password"
                        action={mode === 'login' ? (
                            <Link href="/mot-de-passe-oublie" className="text-[13px] font-medium text-primary-600 hover:text-primary-800">
                                Mot de passe oublié ?
                            </Link>
                        ) : undefined}
                    >
                        <PasswordInput
                            id="auth-password"
                            name="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                            disabled={isLoading}
                            visible={showPassword}
                            onToggleVisible={() => setShowPassword(v => !v)}
                        />
                        {mode === 'register' && <PasswordChecklist password={password} />}
                    </Field>
                )}

                {mode === 'register' && (
                    <Field label="Confirmer le mot de passe" htmlFor="auth-confirm">
                        <Input
                            id="auth-confirm"
                            name="confirm-password"
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
                )}

                {error && (
                    <div role="alert" className={cn(alertClass, 'border-red-200 bg-red-50 text-red-800')}>
                        {error.text}
                        {error.kind === 'unconfirmed' && email.trim() && (
                            <button type="button" onClick={() => resend(email.trim())} disabled={resendIn > 0} className="mt-1.5 block font-medium underline underline-offset-2 disabled:no-underline disabled:opacity-60">
                                {resendIn > 0 ? `Renvoyer l’email de confirmation (${resendIn} s)` : 'Renvoyer l’email de confirmation'}
                            </button>
                        )}
                    </div>
                )}
                {notice && <p role="status" className={cn(alertClass, 'border-vitale-100 bg-vitale-50 text-vitale-700')}>{notice}</p>}

                <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
                    {copy.submit}
                </Button>

                {mode === 'register' && (
                    <p className="text-center text-xs leading-relaxed text-ink-faint">
                        En créant un compte, vous acceptez les{' '}
                        <button type="button" onClick={() => setLegal('cgu')} className="underline underline-offset-2 hover:text-ink">conditions d’utilisation</button>
                        {' '}et la{' '}
                        <button type="button" onClick={() => setLegal('privacy')} className="underline underline-offset-2 hover:text-ink">politique de confidentialité</button>.
                    </p>
                )}
            </form>

            <p className="mt-8 border-t border-rule pt-6 text-center text-sm text-ink-soft">
                {mode === 'login' && (
                    <>Pas encore de compte ? <Link href="/inscription" className="font-semibold text-primary-600 hover:text-primary-800">Créer un compte</Link></>
                )}
                {mode === 'register' && (
                    <>Déjà inscrit ? <Link href="/connexion" className="font-semibold text-primary-600 hover:text-primary-800">Me connecter</Link></>
                )}
                {mode === 'forgot' && (
                    <Link href="/connexion" className="inline-flex items-center gap-2 font-medium text-ink-soft hover:text-ink">
                        <Icon name="arrowLeft" />Retour à la connexion
                    </Link>
                )}
            </p>

            {legal && <Legal type={legal} onClose={() => setLegal(null)} />}
        </div>
    )
}
