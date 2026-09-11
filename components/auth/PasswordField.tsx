'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/cn'

export const PASSWORD_RULES = [
    { label: '8 caractères minimum', missing: '8 caractères', test: (p: string) => p.length >= 8 },
    { label: 'Une majuscule', missing: 'une majuscule', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'Une minuscule', missing: 'une minuscule', test: (p: string) => /[a-z]/.test(p) },
    { label: 'Un caractère spécial', missing: 'un caractère spécial', test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
]

export const missingPasswordRules = (password: string) =>
    PASSWORD_RULES.filter(rule => !rule.test(password)).map(rule => rule.missing)

interface PasswordInputProps extends Omit<React.ComponentProps<'input'>, 'type'> {
    visible: boolean
    onToggleVisible: () => void
}

export function PasswordInput({ visible, onToggleVisible, className, ...props }: PasswordInputProps) {
    const [capsLock, setCapsLock] = useState(false)
    const detectCapsLock = (e: React.KeyboardEvent<HTMLInputElement>) => setCapsLock(e.getModifierState('CapsLock'))

    return (
        <>
            <div className="relative">
                <Input
                    type={visible ? 'text' : 'password'}
                    className={cn('pr-11', className)}
                    onKeyDown={detectCapsLock}
                    onKeyUp={detectCapsLock}
                    onBlur={() => setCapsLock(false)}
                    {...props}
                />
                <button
                    type="button"
                    onClick={onToggleVisible}
                    aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    aria-pressed={visible}
                    className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-ink-faint transition-colors hover:text-ink"
                >
                    <Icon name={visible ? 'eyeOff' : 'eye'} className="size-5" />
                </button>
            </div>
            {capsLock && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-amber-700">
                    <Icon name="alert" className="size-3.5" />
                    Majuscules verrouillées
                </p>
            )}
        </>
    )
}

/** Live checklist + strength bar shown while choosing a password */
export function PasswordChecklist({ password }: { password: string }) {
    const passed = PASSWORD_RULES.filter(rule => rule.test(password)).length
    const barColor = passed === PASSWORD_RULES.length ? 'bg-vitale-500' : passed >= 2 ? 'bg-amber-500' : 'bg-red-500'

    return (
        <div className="mt-3">
            <div className="flex gap-1" aria-hidden="true">
                {PASSWORD_RULES.map((rule, i) => (
                    <span key={rule.label} className={cn('h-1 flex-1 rounded-full transition-colors duration-200', i < passed ? barColor : 'bg-rule')} />
                ))}
            </div>
            <ul className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5" aria-label="Règles du mot de passe">
                {PASSWORD_RULES.map(rule => {
                    const valid = rule.test(password)
                    return (
                        <li key={rule.label} className={cn('flex items-center gap-1.5 text-xs transition-colors', valid ? 'text-vitale-700' : 'text-ink-faint')}>
                            <Icon name={valid ? 'check' : 'plus'} className={cn('size-3.5', !valid && 'rotate-45')} strokeWidth={2.5} />
                            {rule.label}
                            <span className="sr-only">{valid ? ' : respecté' : ' : manquant'}</span>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
