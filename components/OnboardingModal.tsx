'use client'

import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Button } from './ui/button';

interface OnboardingModalProps {
    isOpen: boolean;
    onComplete: () => void;
    initialData: UserProfile | null;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete, initialData }) => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
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

    const handleNext = () => {
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to save profile');

            onComplete();
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la sauvegarde. Veuillez réessayer.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-500">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 border border-slate-100">

                {/* Header with decorative background */}
                <div className="relative bg-gradient-to-br from-primary-600 to-primary-800 px-8 py-10 text-white overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-500/30 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium mb-4 border border-white/10">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                Configuration initiale
                            </div>
                            <h2 className="text-3xl font-bold mb-2 tracking-tight">
                                {step === 1 && "Bienvenue à bord ! 👋"}
                                {step === 2 && "Où exercez-vous ? 📍"}
                                {step === 3 && "Derniers détails 📝"}
                            </h2>
                            <p className="text-primary-100 text-lg max-w-md leading-relaxed">
                                {step === 1 && "Commençons par votre identité professionnelle pour personnaliser vos documents."}
                                {step === 2 && "Ces informations apparaîtront sur vos factures pour vos patients."}
                                {step === 3 && "Ajoutez vos identifiants légaux pour être en conformité."}
                            </p>
                        </div>
                        <div className="hidden md:flex flex-col items-center gap-1">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-xl font-bold shadow-lg">
                                {step}/3
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 bg-slate-100 w-full">
                    <div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                <div className="p-8 md:p-10 overflow-y-auto bg-slate-50/50 flex-1">
                    {/* Form Content */}
                    <div className="max-w-lg mx-auto">
                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-primary-200 transition-colors group">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 group-hover:text-primary-600 transition-colors">Nom complet / Raison sociale <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.full_name || ''}
                                            onChange={(e) => handleChange('full_name', e.target.value)}
                                            placeholder="Ex: Dr. Martin Dupont"
                                            className="w-full pl-11 border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3.5 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                            autoFocus
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2 ml-1">Ce nom apparaîtra en en-tête de vos factures.</p>
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-primary-200 transition-colors group">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 group-hover:text-primary-600 transition-colors">Spécialité</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.specialty || ''}
                                            onChange={(e) => handleChange('specialty', e.target.value)}
                                            placeholder="Ex: Infirmier Libéral, Kinésithérapeute..."
                                            className="w-full pl-11 border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3.5 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-primary-200 transition-colors group">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 group-hover:text-primary-600 transition-colors">Adresse du cabinet</label>
                                    <div className="relative">
                                        <div className="absolute top-3.5 left-4 flex items-start pointer-events-none">
                                            <svg className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        </div>
                                        <textarea
                                            value={formData.address || ''}
                                            onChange={(e) => handleChange('address', e.target.value)}
                                            placeholder="Ex: 123 Avenue de la République, 75000 Paris"
                                            rows={3}
                                            className="w-full pl-11 border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3.5 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400 resize-none"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-primary-200 transition-colors group">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 group-hover:text-primary-600 transition-colors">Téléphone</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        </div>
                                        <input
                                            type="tel"
                                            value={formData.phone || ''}
                                            onChange={(e) => handleChange('phone', e.target.value)}
                                            placeholder="Ex: 01 23 45 67 89"
                                            className="w-full pl-11 border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3.5 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-primary-200 transition-colors group">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 group-hover:text-primary-600 transition-colors">N° SIRET</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.siret || ''}
                                            onChange={(e) => handleChange('siret', e.target.value)}
                                            placeholder="14 chiffres"
                                            className="w-full pl-11 border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3.5 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-primary-200 transition-colors group">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 group-hover:text-primary-600 transition-colors">N° ADELI / RPPS</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.adeli || ''}
                                            onChange={(e) => handleChange('adeli', e.target.value)}
                                            placeholder="Optionnel"
                                            className="w-full pl-11 border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3.5 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 bg-white flex justify-between items-center shrink-0">
                    {step > 1 ? (
                        <button
                            onClick={handleBack}
                            className="text-slate-500 hover:text-slate-800 font-medium text-sm px-6 py-3 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Retour
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 text-sm text-slate-400 font-medium px-2">
                            <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                            Étape {step} sur 3
                        </div>
                    )}

                    {step < 3 ? (
                        <Button onClick={handleNext} disabled={step === 1 && !formData.full_name} className="px-8 py-3 rounded-xl shadow-lg shadow-primary-500/20 text-base hover:scale-105 active:scale-95 transition-all duration-200">
                            Continuer
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} isLoading={isLoading} className="px-8 py-3 rounded-xl shadow-lg shadow-primary-500/20 text-base hover:scale-105 active:scale-95 transition-all duration-200 bg-gradient-to-r from-primary-600 to-primary-500">
                            Terminer l'inscription
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
