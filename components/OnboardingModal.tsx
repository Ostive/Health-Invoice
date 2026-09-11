'use client'

import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Button } from './ui/button';
import { Field, Input, Textarea } from './ui/input';
import { LogoMark } from './ui/logo';
import { Icon } from './ui/icon';
import { cn } from '@/lib/cn';

interface OnboardingModalProps {
    isOpen: boolean;
    onComplete: () => void;
    initialData: UserProfile | null;
}

const STEPS = [
    { title: 'Votre identité professionnelle', description: 'Elle figure en tête de chacune de vos factures.' },
    { title: 'Votre cabinet', description: 'L’adresse et le téléphone que vos patients verront.' },
    { title: 'Vos numéros professionnels', description: 'Ils sont obligatoires sur une facture de soins.' },
];

/** The practitioner's rubber stamp, built live from what they type */
const ProfessionalStamp = ({ data }: { data: Partial<UserProfile> }) => {
    const placeholder = (value: string | undefined, fallback: string) =>
        value?.trim() ? value : <span className="opacity-40">{fallback}</span>;
    const addressLines = (data.address || '').split(/\n|,/).map(l => l.trim()).filter(Boolean).slice(0, 2);

    return (
        <div className="stamp-grain rotate-[-3deg] rounded-md border-[2.5px] border-primary-600 p-1 text-primary-700">
            <div className="rounded-[3px] border border-primary-600 px-4 py-3.5 text-center">
                <p className="font-display text-[13px] font-bold uppercase leading-tight tracking-[0.04em]">{placeholder(data.full_name, 'Votre nom')}</p>
                <p className="mt-1 text-[11px] font-medium">{placeholder(data.specialty, 'Votre spécialité')}</p>
                <div className="mt-2 text-[10.5px] leading-snug">
                    {addressLines.length > 0 ? addressLines.map(line => <p key={line}>{line}</p>) : <p className="opacity-40">Adresse du cabinet</p>}
                    {data.phone?.trim() && <p>Tél. {data.phone}</p>}
                </div>
                <p className="mt-2 font-mono text-[10px]">ADELI {placeholder(data.adeli, '·· · ····· ·')}</p>
                {data.siret?.trim() && <p className="font-mono text-[10px]">SIRET {data.siret}</p>}
            </div>
        </div>
    );
};

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete, initialData }) => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<UserProfile>>({
        full_name: initialData?.full_name || '',
        specialty: initialData?.specialty || '',
        address: initialData?.address || '',
        phone: initialData?.phone || '',
        siret: initialData?.siret || '',
        adeli: initialData?.adeli || ''
    });

    if (!isOpen) return null;

    const handleChange = (field: keyof UserProfile, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to save profile');

            onComplete();
        } catch (err) {
            console.error(err);
            setError("Vos informations n'ont pas pu être enregistrées. Vérifiez votre connexion et réessayez.");
        } finally {
            setIsLoading(false);
        }
    };

    const goNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (step < STEPS.length) setStep(step + 1);
        else handleSubmit();
    };

    const current = STEPS[step - 1];
    const canContinue = step !== 1 || !!formData.full_name?.trim();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-[2px] animate-in fade-in duration-300">
            <div role="dialog" aria-modal="true" aria-labelledby="onboarding-title" className="grid max-h-[92dvh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-pop animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 md:grid-cols-[1fr_300px]">
                <form onSubmit={goNext} className="flex min-h-0 flex-col">
                    <div className="overflow-y-auto p-7 sm:p-9">
                        <div className="flex items-center justify-between">
                            <LogoMark />
                            <p className="font-mono text-xs text-ink-soft">Étape {step} sur {STEPS.length}</p>
                        </div>
                        <div className="mt-5 flex gap-1.5" aria-hidden="true">
                            {STEPS.map((_, i) => (
                                <span key={i} className={cn('h-1 flex-1 rounded-full transition-colors duration-300', i < step ? 'bg-primary-600' : 'bg-rule')} />
                            ))}
                        </div>

                        <h2 id="onboarding-title" className="mt-8 font-display text-2xl font-semibold text-ink">{current.title}</h2>
                        <p className="mt-2 text-sm text-ink-soft">{current.description}</p>

                        <div key={step} className="mt-7 space-y-5 animate-in fade-in slide-in-from-right-3 duration-300">
                            {step === 1 && (
                                <>
                                    <Field label="Nom complet ou raison sociale" htmlFor="onb-name">
                                        <Input id="onb-name" type="text" required value={formData.full_name || ''} onChange={(e) => handleChange('full_name', e.target.value)} placeholder="Dr Martin Dupont" autoComplete="name" autoFocus />
                                    </Field>
                                    <Field label="Spécialité" htmlFor="onb-specialty">
                                        <Input id="onb-specialty" type="text" value={formData.specialty || ''} onChange={(e) => handleChange('specialty', e.target.value)} placeholder="Infirmière diplômée d’État" />
                                    </Field>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <Field label="Adresse du cabinet" htmlFor="onb-address">
                                        <Textarea id="onb-address" rows={3} value={formData.address || ''} onChange={(e) => handleChange('address', e.target.value)} placeholder={'123 avenue de la République\n75011 Paris'} autoComplete="street-address" autoFocus />
                                    </Field>
                                    <Field label="Téléphone" htmlFor="onb-phone">
                                        <Input id="onb-phone" type="tel" value={formData.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} placeholder="01 23 45 67 89" autoComplete="tel" />
                                    </Field>
                                </>
                            )}

                            {step === 3 && (
                                <>
                                    <Field label="N° ADELI / RPPS" htmlFor="onb-adeli">
                                        <Input id="onb-adeli" type="text" value={formData.adeli || ''} onChange={(e) => handleChange('adeli', e.target.value)} placeholder="75 1 23456 7" className="font-mono" autoFocus />
                                    </Field>
                                    <Field label="N° SIRET" htmlFor="onb-siret" hint="14 chiffres. Vous pouvez le compléter plus tard dans les paramètres.">
                                        <Input id="onb-siret" type="text" inputMode="numeric" value={formData.siret || ''} onChange={(e) => handleChange('siret', e.target.value)} placeholder="123 456 789 00012" className="font-mono" />
                                    </Field>
                                </>
                            )}
                        </div>

                        {error && (
                            <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800">{error}</p>
                        )}
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-rule px-7 py-4 sm:px-9">
                        {step > 1 ? (
                            <Button variant="ghost" onClick={() => setStep(step - 1)}>
                                <Icon name="arrowLeft" />Retour
                            </Button>
                        ) : <span />}
                        <Button type="submit" disabled={!canContinue} isLoading={isLoading}>
                            {step < STEPS.length ? <>Continuer<Icon name="arrowRight" /></> : <>Terminer<Icon name="check" strokeWidth={2.25} /></>}
                        </Button>
                    </div>
                </form>

                <aside className="hidden flex-col justify-center gap-6 border-l border-rule bg-paper p-8 md:flex" aria-label="Aperçu de votre tampon">
                    <ProfessionalStamp data={formData} />
                    <p className="text-center text-xs leading-relaxed text-ink-soft">
                        Votre tampon, tel qu’il apparaîtra en en-tête de vos factures.
                    </p>
                </aside>
            </div>
        </div>
    );
};
