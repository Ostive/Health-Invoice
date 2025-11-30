'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from './ui/button'

export type AuthMode = 'login' | 'register' | 'forgot_password'

interface AuthProps {
  initialMode: AuthMode
  onClose?: () => void
}

interface FormField {
  id: string
  label: string
  type: string
  placeholder: string
  value: string
  setValue: (val: string) => void
  iconPath: string
  minLength?: number
  extraLabelContent?: React.ReactNode
  autoComplete?: string
}

export const Auth: React.FC<AuthProps> = ({ initialMode, onClose }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const supabase = React.useMemo(() => createClient(), [])

  useEffect(() => {
    setMode(initialMode)
    setError(null)
    setMessage(null)
  }, [initialMode])

  const translateError = (errorMsg: string) => {
    if (errorMsg.includes("Invalid login credentials")) {
      return "Oups ! Email ou mot de passe incorrect. Réessayez ?"
    }
    if (errorMsg.includes("User already registered")) {
      return "Ce compte existe déjà. Connectez-vous !"
    }
    if (errorMsg.includes("Password should be at least")) {
      return "Le mot de passe doit contenir au moins 6 caractères."
    }
    if (errorMsg.includes("Email not confirmed")) {
      return "Veuillez confirmer votre email avant de vous connecter."
    }
    return "Une erreur est survenue. Veuillez réessayer."
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (mode === 'register') {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Registration failed')
        }

        if (data.session) {
          setMessage("Inscription réussie ! Connexion en cours...");
          window.location.href = '/dashboard';
          return;
        }

        setMessage("Inscription réussie ! Redirection vers la connexion...");
        setTimeout(() => {
          setMode('login');
          setMessage(null);
        }, 2000);
      } else if (mode === 'login') {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            password: password
          })
        })

        const data = await response.json()

        if (!response.ok) {
          console.error('Login error:', {
            message: data.error,
            status: response.status
          })
          throw new Error(data.error || 'Login failed')
        }

        // Redirect to dashboard
        window.location.href = '/dashboard'
      } else if (mode === 'forgot_password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback`,
        })
        if (error) throw error
        setMessage("Si cet email existe, un lien de réinitialisation a été envoyé.")
      }
    } catch (err: any) {
      setError(translateError(err.message || ""))
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemoCredentials = () => {
    setEmail('ostivekevin6@gmail.com')
    setPassword('Ostive2002')
  }

  const getFields = (): FormField[] => {
    const fields: FormField[] = [
      {
        id: 'email',
        label: 'Email professionnel',
        type: 'email',
        placeholder: 'vous@cabinet.fr',
        value: email,
        setValue: setEmail,
        iconPath: "M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207",
        autoComplete: "email"
      }
    ]

    if (mode !== 'forgot_password') {
      fields.push({
        id: 'password',
        label: 'Mot de passe',
        type: 'password',
        placeholder: '••••••••',
        value: password,
        setValue: setPassword,
        minLength: 6,
        iconPath: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
        autoComplete: mode === 'register' ? 'new-password' : 'current-password',
        extraLabelContent: mode === 'login' ? (
          <button
            type="button"
            onClick={() => setMode('forgot_password')}
            className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
            title="Réinitialiser le mot de passe"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Oublié ?
          </button>
        ) : undefined
      })
    }

    return fields
  }

  const renderTitle = () => {
    const titles = {
      login: 'Connexion',
      register: 'Créer un compte',
      forgot_password: 'Mot de passe oublié'
    }
    return titles[mode]
  }

  const renderSubtitle = () => {
    const subtitles = {
      login: 'Accédez à votre espace sécurisé',
      register: 'Commencez votre essai gratuit de 14 jours',
      forgot_password: 'Entrez votre email pour réinitialiser'
    }
    return subtitles[mode]
  }

  const renderButtonText = () => {
    if (isLoading) return "Chargement..."
    const buttons = {
      login: 'Se connecter',
      register: "S'inscrire",
      forgot_password: 'Envoyer le lien'
    }
    return buttons[mode]
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative my-8">
        {onClose && (
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-lg shadow-primary-600/30">F</div>
          <h2 className="text-2xl font-bold text-slate-900">{renderTitle()}</h2>
          <p className="text-slate-500 text-sm mt-2">{renderSubtitle()}</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          {getFields().map((field) => (
            <div key={field.id}>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700">{field.label}</label>
                {field.extraLabelContent}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={field.iconPath} />
                  </svg>
                </div>
                <input
                  type={field.type}
                  required
                  minLength={field.minLength}
                  value={field.value}
                  onChange={(e) => field.setValue(e.target.value)}
                  className="w-full pl-10 border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  disabled={isLoading}
                />
              </div>
            </div>
          ))}

          {/* Shortcut for Demo User */}
          {mode === 'login' && (
            <button
              type="button"
              onClick={fillDemoCredentials}
              disabled={isLoading}
              className="w-full py-2 text-xs font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 hover:text-slate-700 rounded-lg transition-colors flex items-center justify-center gap-2 border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              Remplir compte test (Démo)
            </button>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-start gap-2">
              <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-red-600 text-sm">{error}</span>
            </div>
          )}

          {message && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-100 flex items-start gap-2">
              <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-green-600 text-sm">{message}</span>
            </div>
          )}

          <Button type="submit" className="w-full py-3 text-base shadow-lg shadow-primary-500/20" isLoading={isLoading}>
            {renderButtonText()}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-600 border-t border-slate-100 pt-6">
          {mode === 'login' && (
            <>
              Pas encore de compte ?
              <button onClick={() => setMode('register')} disabled={isLoading} className="text-primary-600 font-bold hover:underline ml-1 disabled:opacity-50 disabled:cursor-not-allowed">
                Créer un compte
              </button>
            </>
          )}
          {mode === 'register' && (
            <>
              Déjà inscrit ?
              <button onClick={() => setMode('login')} disabled={isLoading} className="text-primary-600 font-bold hover:underline ml-1 disabled:opacity-50 disabled:cursor-not-allowed">
                Se connecter
              </button>
            </>
          )}
          {mode === 'forgot_password' && (
            <button onClick={() => setMode('login')} disabled={isLoading} className="text-primary-600 font-bold hover:underline flex items-center justify-center gap-1 w-full disabled:opacity-50 disabled:cursor-not-allowed">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Retour à la connexion
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
