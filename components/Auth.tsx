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
      return "Identifiants incorrects. Vérifiez votre email et mot de passe."
    }
    if (errorMsg.includes("User already registered")) {
      return "Ce compte existe déjà. Connectez-vous directement !"
    }
    if (errorMsg.includes("Password should be at least")) {
      return "Le mot de passe est un peu court (6 caractères min)."
    }
    if (errorMsg.includes("Email not confirmed")) {
      return "Votre email n'est pas confirmé. Vérifiez votre boîte de réception."
    }
    if (errorMsg.includes("Rate limit")) {
      return "Trop de tentatives. Veuillez patienter quelques instants."
    }
    return "Une petite erreur technique est survenue. Veuillez réessayer."
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
          setMessage("Bienvenue ! Connexion en cours...");
          window.location.href = '/dashboard';
          return;
        }

        setMessage("Compte créé ! Redirection vers la connexion...");
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
        setMessage("Si cet email est enregistré, vous recevrez un lien magique.")
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
        placeholder: 'exemple@cabinet.fr',
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
            className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            Mot de passe oublié ?
          </button>
        ) : undefined
      })
    }

    return fields
  }

  const renderTitle = () => {
    const titles = {
      login: 'Bon retour !',
      register: 'Créer un compte',
      forgot_password: 'Réinitialisation'
    }
    return titles[mode]
  }

  const renderSubtitle = () => {
    const subtitles = {
      login: 'Connectez-vous pour gérer vos factures',
      register: 'Rejoignez-nous pour simplifier votre gestion',
      forgot_password: 'Nous allons vous aider à récupérer votre accès'
    }
    return subtitles[mode]
  }

  const renderButtonText = () => {
    if (isLoading) return "Chargement..."
    const buttons = {
      login: 'Se connecter',
      register: "Commencer gratuitement",
      forgot_password: 'Envoyer le lien'
    }
    return buttons[mode]
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative my-8 border border-slate-100 transform transition-all">
        {onClose && (
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-50 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-5 shadow-lg shadow-primary-500/30 transform rotate-3">
            F
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{renderTitle()}</h2>
          <p className="text-slate-500 text-sm mt-2">{renderSubtitle()}</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          {getFields().map((field) => (
            <div key={field.id}>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-slate-700">{field.label}</label>
                {field.extraLabelContent}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500">
                  <svg className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={field.iconPath} />
                  </svg>
                </div>
                <input
                  type={field.type}
                  required
                  minLength={field.minLength}
                  value={field.value}
                  onChange={(e) => field.setValue(e.target.value)}
                  className="w-full pl-10 border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="w-full py-2.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-primary-600 rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-200 border-dashed hover:border-primary-200 hover:border-solid disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              Remplir compte de démonstration
            </button>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-in slide-in-from-top-2 duration-200">
              <div className="bg-red-100 p-1 rounded-full shrink-0">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <span className="text-red-700 text-sm font-medium pt-0.5">{error}</span>
            </div>
          )}

          {message && (
            <div className="p-4 rounded-xl bg-green-50 border border-green-100 flex items-start gap-3 animate-in slide-in-from-top-2 duration-200">
              <div className="bg-green-100 p-1 rounded-full shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="text-green-700 text-sm font-medium pt-0.5">{message}</span>
            </div>
          )}

          <Button type="submit" className="w-full py-3.5 text-base font-semibold shadow-xl shadow-primary-500/20 hover:shadow-primary-500/30 transition-all active:scale-[0.98]" isLoading={isLoading}>
            {renderButtonText()}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-600 border-t border-slate-100 pt-6">
          {mode === 'login' && (
            <>
              Pas encore de compte ?
              <button onClick={() => setMode('register')} disabled={isLoading} className="text-primary-600 font-bold hover:text-primary-700 hover:underline ml-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Créer un compte
              </button>
            </>
          )}
          {mode === 'register' && (
            <>
              Déjà inscrit ?
              <button onClick={() => setMode('login')} disabled={isLoading} className="text-primary-600 font-bold hover:text-primary-700 hover:underline ml-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Se connecter
              </button>
            </>
          )}
          {mode === 'forgot_password' && (
            <button onClick={() => setMode('login')} disabled={isLoading} className="text-slate-500 font-medium hover:text-slate-800 flex items-center justify-center gap-2 w-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Retour à la connexion
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
