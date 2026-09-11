'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { UserProfile } from '@/types'
import { Button } from '@/components/ui/button'
import { Field, Input, Textarea } from '@/components/ui/input'
import { useDashboard } from '@/components/dashboard/DashboardContext'
import { errorMessage } from '@/lib/errors'
import { SettingsCard, SettingsHeading } from './SettingsCard'

export function ProfileSettings() {
    const { profile, refreshProfile, setToast } = useDashboard()
    const [formData, setFormData] = useState<Partial<UserProfile>>({})
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                specialty: profile.specialty || '',
                address: profile.address || '',
                phone: profile.phone || '',
                siret: profile.siret || '',
                adeli: profile.adeli || '',
                is_vat_applicable: profile.is_vat_applicable || false,
            })
        }
    }, [profile])

    const handleChange = (field: keyof UserProfile, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const hasChanges = useMemo(() => {
        if (!profile) return false
        return (
            (formData.full_name || '') !== (profile.full_name || '') ||
            (formData.specialty || '') !== (profile.specialty || '') ||
            (formData.address || '') !== (profile.address || '') ||
            (formData.phone || '') !== (profile.phone || '') ||
            (formData.siret || '') !== (profile.siret || '') ||
            (formData.adeli || '') !== (profile.adeli || '') ||
            (formData.is_vat_applicable || false) !== (profile.is_vat_applicable || false)
        )
    }, [formData, profile])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            const response = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })
            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to save profile')
            }
            await refreshProfile()
            setToast({ message: 'Profil enregistré', type: 'success' })
        } catch (err) {
            setToast({ message: "Le profil n'a pas pu être enregistré : " + errorMessage(err), type: 'error' })
        } finally {
            setIsSaving(false)
        }
    }

    const textField = (field: keyof UserProfile, label: string, props: React.ComponentProps<'input'> = {}) => (
        <Field label={label} htmlFor={`settings-${field}`}>
            <Input
                id={`settings-${field}`}
                type="text"
                value={(formData[field] as string) || ''}
                onChange={(e) => handleChange(field, e.target.value)}
                disabled={isSaving}
                {...props}
            />
        </Field>
    )

    return (
        <form onSubmit={handleSave} className="space-y-6">
            <SettingsHeading title="Profil et coordonnées" description="Ces informations figurent en en-tête de vos factures." />

            <SettingsCard title="Identité professionnelle">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {textField('full_name', 'Nom complet ou raison sociale', { placeholder: 'Dr Martin Dupont', autoComplete: 'name' })}
                    {textField('specialty', 'Spécialité', { placeholder: 'Infirmier libéral' })}
                    {textField('adeli', 'N° ADELI / RPPS', { placeholder: '75 1 23456 7', className: 'font-mono' })}
                    {textField('siret', 'SIRET', { placeholder: '123 456 789 00012', className: 'font-mono', inputMode: 'numeric' })}
                </div>
            </SettingsCard>

            <SettingsCard title="Cabinet">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Field label="Adresse du cabinet" htmlFor="settings-address" className="md:col-span-2">
                        <Textarea
                            id="settings-address"
                            rows={2}
                            value={formData.address || ''}
                            onChange={(e) => handleChange('address', e.target.value)}
                            placeholder="123 avenue de la République, 75011 Paris"
                            disabled={isSaving}
                        />
                    </Field>
                    {textField('phone', 'Téléphone', { type: 'tel', placeholder: '01 23 45 67 89', autoComplete: 'tel' })}
                </div>
            </SettingsCard>

            <SettingsCard>
                <label htmlFor="settings-vat" className="flex cursor-pointer items-center justify-between gap-6">
                    <span>
                        <span className="block text-sm font-medium text-ink">Facturer la TVA</span>
                        <span className="mt-0.5 block text-[13px] text-ink-soft">La plupart des soins sont exonérés (art. 261 du CGI). Activez uniquement si vous y êtes assujetti.</span>
                    </span>
                    <span className="relative inline-flex shrink-0">
                        <input
                            id="settings-vat"
                            type="checkbox"
                            role="switch"
                            className="peer sr-only"
                            checked={formData.is_vat_applicable || false}
                            onChange={(e) => handleChange('is_vat_applicable', e.target.checked)}
                            disabled={isSaving}
                        />
                        <span className="h-6 w-11 rounded-full bg-rule-strong transition-colors peer-checked:bg-primary-600 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-600" />
                        <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
                    </span>
                </label>
            </SettingsCard>

            <div className="sticky bottom-0 flex items-center justify-end gap-3 rounded-xl border border-rule bg-white/95 px-4 py-3 backdrop-blur">
                <p className="mr-auto text-[13px] text-ink-soft" aria-live="polite">
                    {hasChanges ? 'Modifications non enregistrées' : 'Tout est enregistré'}
                </p>
                <Button type="submit" isLoading={isSaving} disabled={!hasChanges || isSaving}>Enregistrer</Button>
            </div>
        </form>
    )
}
