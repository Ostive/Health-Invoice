'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile } from '../types';
import { Button } from './ui/button';
import { manageSubscription, subscribeToPro, reactivateSubscription } from '../services/stripeService';

import { ToastType } from './ui/toast';
import { Modal } from './ui/modal';
import { useRouter } from 'next/navigation';

interface SettingsProps {
  profile: UserProfile | null;
  onUpdate: () => void;
  onClose: () => void;
  onShowToast: (message: string, type: ToastType) => void;
  activeSection: 'general' | 'subscription' | 'security';
  onSectionChange: (section: 'general' | 'subscription' | 'security') => void;
}

export const Settings: React.FC<SettingsProps> = ({ profile, onUpdate, onClose, onShowToast, activeSection, onSectionChange }) => {
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        specialty: profile.specialty || '',
        address: profile.address || '',
        phone: profile.phone || '',
        siret: profile.siret || '',
        adeli: profile.adeli || '',
        is_vat_applicable: profile.is_vat_applicable || false
      });
    }
  }, [profile]);

  const handleChange = (field: keyof UserProfile, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const hasChanges = useMemo(() => {
    if (!profile) return Object.keys(formData).length > 0;

    return (
      (formData.full_name || '') !== (profile.full_name || '') ||
      (formData.specialty || '') !== (profile.specialty || '') ||
      (formData.address || '') !== (profile.address || '') ||
      (formData.phone || '') !== (profile.phone || '') ||
      (formData.siret || '') !== (profile.siret || '') ||
      (formData.adeli || '') !== (profile.adeli || '') ||
      (formData.is_vat_applicable) !== (profile.is_vat_applicable || false)
    );
  }, [formData, profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSaving(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save profile');
      }

      onUpdate();
      onShowToast('Profil mis à jour avec succès !', 'success');
    } catch (err: any) {
      console.error(err);
      onShowToast("Erreur lors de la sauvegarde : " + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'supprimer') return;

    setIsDeleting(true);
    try {
      const response = await fetch('/api/delete-account', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du compte');
      }

      onShowToast('Compte supprimé avec succès. Au revoir !', 'success');
      router.push('/');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      onShowToast("Erreur : " + err.message, 'error');
      setIsDeleting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 w-full animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex justify-between items-center shrink-0 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="md:hidden text-slate-500 hover:text-slate-700 p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Paramètres</h2>
          </div>
        </div>
        <div className="flex gap-2 md:gap-3">
          <Button variant="outline" size="sm" onClick={onUpdate} title="Rafraîchir les données" className="px-2 md:px-3">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </Button>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSaving} className="hidden md:flex">Fermer</Button>

          {/* Desktop Save */}
          <Button size="sm" onClick={handleSave} isLoading={isSaving} disabled={!hasChanges || isSaving} className="hidden md:flex px-6 shadow-sm">Enregistrer</Button>

          {/* Mobile Save Icon */}
          <Button size="sm" onClick={handleSave} isLoading={isSaving} disabled={!hasChanges || isSaving} className="md:hidden px-3 shadow-sm">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" /></svg>
          </Button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden max-w-7xl mx-auto w-full">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-white md:bg-transparent border-b md:border-b-0 md:border-r border-slate-200 flex flex-row md:flex-col md:py-8 shrink-0 overflow-x-auto md:overflow-visible sticky top-0 z-20 [&::-webkit-scrollbar]:hidden">
          <nav className="flex md:flex-col gap-2 p-2 md:px-4 w-full min-w-max">
            <div className="px-3 mb-2 hidden md:block">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Compte</span>
            </div>

            <button
              onClick={() => onSectionChange('general')}
              disabled={isSaving}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${activeSection === 'general'
                ? 'bg-white shadow-sm text-primary-700 ring-1 ring-slate-200'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
              <div className={`p-1 rounded ${activeSection === 'general' ? 'bg-primary-50 text-primary-600' : 'text-slate-400'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              Profil & Coordonnées
            </button>

            <button
              onClick={() => onSectionChange('subscription')}
              disabled={isSaving}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${activeSection === 'subscription'
                ? 'bg-white shadow-sm text-primary-700 ring-1 ring-slate-200'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
              <div className={`p-1 rounded ${activeSection === 'subscription' ? 'bg-primary-50 text-primary-600' : 'text-slate-400'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              </div>
              Abonnement
            </button>

            <button
              onClick={() => onSectionChange('security')}
              disabled={isSaving}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${activeSection === 'security'
                ? 'bg-white shadow-sm text-primary-700 ring-1 ring-slate-200'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
              <div className={`p-1 rounded ${activeSection === 'security' ? 'bg-primary-50 text-primary-600' : 'text-slate-400'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              Sécurité
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-8 pb-20">

            {activeSection === 'general' && (
              <>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Informations Générales</h3>
                  <p className="text-slate-500 text-sm">Gérez les informations qui apparaîtront sur vos documents.</p>
                </div>

                {/* Identity Section */}
                <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h4 className="font-semibold text-slate-800 text-sm">Identité Professionnelle</h4>
                  </div>
                  <div className="p-6 grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nom complet / Raison sociale</label>
                        <input
                          type="text"
                          value={formData.full_name || ''}
                          onChange={(e) => handleChange('full_name', e.target.value)}
                          placeholder="Dr. Martin Dupont"
                          disabled={isSaving}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm disabled:bg-slate-50 disabled:text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Spécialité</label>
                        <input
                          type="text"
                          value={formData.specialty || ''}
                          onChange={(e) => handleChange('specialty', e.target.value)}
                          placeholder="Infirmier Libéral"
                          disabled={isSaving}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm resize-none disabled:bg-slate-50 disabled:text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Téléphone</label>
                        <input
                          type="tel"
                          value={formData.phone || ''}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          placeholder="01 23 45 67 89"
                          disabled={isSaving}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm disabled:bg-slate-50 disabled:text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">N° ADELI / RPPS</label>
                        <input
                          type="text"
                          value={formData.adeli || ''}
                          onChange={(e) => handleChange('adeli', e.target.value)}
                          placeholder="123456789"
                          disabled={isSaving}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm disabled:bg-slate-50 disabled:text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">SIRET</label>
                        <input
                          type="text"
                          value={formData.siret || ''}
                          onChange={(e) => handleChange('siret', e.target.value)}
                          placeholder="123 456 789 00012"
                          disabled={isSaving}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm disabled:bg-slate-50 disabled:text-slate-500"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-semibold text-slate-800">Assujetti à la TVA ?</h5>
                        <p className="text-xs text-slate-500 mt-1">Cochez cette case si vous devez facturer la TVA.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={formData.is_vat_applicable || false}
                          onChange={(e) => handleChange('is_vat_applicable', e.target.checked)}
                          disabled={isSaving}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                </section>
              </>
            )}

            {activeSection === 'subscription' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center max-w-2xl mx-auto mb-8">
                  <h3 className="text-3xl font-bold text-slate-900 mb-3">Gérez votre abonnement</h3>
                  <p className="text-slate-500 text-lg">Choisissez le plan adapté à votre activité et simplifiez votre facturation.</p>
                </div>

                {/* Subscription Ended Alert */}
                {!profile?.is_pro && profile?.stripe_customer_id && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 mb-8">
                    <div className="p-1 bg-amber-100 rounded-full text-amber-600 shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-800">Votre abonnement a pris fin</h4>
                      <p className="text-amber-700 text-sm mt-1">
                        Votre accès PRO est terminé. Réabonnez-vous ci-dessous pour retrouver immédiatement tous vos avantages et votre historique illimité.
                      </p>
                    </div>
                  </div>
                )}

                {/* Current Subscription Status Card - Only for PRO users */}
                {profile?.is_pro && (
                  <div className={`bg-gradient-to-br ${profile.cancel_at_period_end ? 'from-orange-50 to-amber-50 border-orange-200' : 'from-emerald-50 to-teal-50 border-emerald-200'} border rounded-2xl p-6 shadow-sm mb-8 relative overflow-hidden`}>
                    <div className={`absolute top-0 right-0 w-32 h-32 ${profile.cancel_at_period_end ? 'bg-orange-100/50' : 'bg-emerald-100/50'} rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`}></div>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 bg-gradient-to-br ${profile.cancel_at_period_end ? 'from-orange-500 to-amber-600 shadow-orange-500/20' : 'from-emerald-500 to-teal-600 shadow-emerald-500/20'} rounded-2xl flex items-center justify-center shrink-0 shadow-lg text-white`}>
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-xl font-bold text-slate-900">Plan Professionnel</h4>
                            {profile.cancel_at_period_end ? (
                              <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide border border-orange-200">Se termine bientôt</span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide border border-emerald-200">Actif</span>
                            )}
                          </div>
                          <p className="text-slate-600 mb-2">
                            {profile.cancel_at_period_end ? 'Votre accès prendra fin le ' : 'Renouvellement le '}
                            <strong>
                              {profile.current_period_end
                                ? new Date(profile.current_period_end).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                              }
                            </strong>
                          </p>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className={`flex items-center gap-1.5 ${profile.cancel_at_period_end ? 'text-orange-600' : 'text-emerald-500'}`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                              29€/mois
                            </span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className={`flex items-center gap-1.5 ${profile.cancel_at_period_end ? 'text-orange-600' : 'text-emerald-500'}`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              {profile.cancel_at_period_end ? 'Annulation programmée' : 'Annulable à tout moment'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={async () => {
                          if (!profile?.id) return;
                          if (profile.cancel_at_period_end) {
                            setIsSaving(true);
                            try {
                              await reactivateSubscription(profile.id);
                              onUpdate();
                              onShowToast('Abonnement réactivé avec succès !', 'success');
                            } catch (err: any) {
                              onShowToast("Erreur lors de la réactivation : " + err.message, 'error');
                            } finally {
                              setIsSaving(false);
                            }
                          } else {
                            manageSubscription(profile.id);
                          }
                        }}
                        variant="outline"
                        className={`bg-white shadow-sm w-full md:w-auto justify-center ${profile.cancel_at_period_end ? 'border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300'}`}
                        disabled={isSaving}
                      >
                        {profile.cancel_at_period_end ? 'Réactiver l\'abonnement' : 'Gérer l\'abonnement'}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-8 items-stretch">
                  {/* Free Plan Card */}
                  <div className={`relative rounded-3xl border transition-all duration-300 flex flex-col ${profile?.is_pro ? 'border-slate-200 bg-white hover:border-slate-300' : 'border-slate-200 bg-slate-50/50 opacity-75 hover:opacity-100'}`}>
                    <div className="p-8 flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-slate-900">Découverte</h4>
                          <p className="text-slate-500 text-sm mt-1">Pour tester l'application</p>
                        </div>
                      </div>
                      <div className="mb-6 flex items-baseline">
                        <span className="text-4xl font-extrabold text-slate-900">0€</span>
                        <span className="text-slate-500 ml-2 font-medium">/ mois</span>
                      </div>
                      <hr className="border-slate-100 mb-6" />
                      <ul className="space-y-4 mb-8">
                        {[
                          '3 factures par mois',
                          'Modèles standards',
                          'Export PDF basique',
                          'Support par email'
                        ].map((feature, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                            <div className="p-0.5 rounded-full bg-slate-100 text-slate-500 mt-0.5">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-8 pt-0 mt-auto">
                      {profile?.is_pro ? (
                        <Button variant="outline" className="w-full justify-center border-slate-200 text-slate-400 cursor-not-allowed" disabled>Inclus</Button>
                      ) : (
                        <Button variant="outline" className="w-full justify-center border-slate-300 text-slate-700 bg-white hover:bg-slate-50" disabled>Votre plan actuel</Button>
                      )}
                    </div>
                  </div>

                  {/* Pro Plan Card */}
                  <div className={`relative rounded-3xl border-2 flex flex-col shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${profile?.is_pro ? 'border-emerald-500 bg-white ring-4 ring-emerald-500/10' : 'border-primary-600 bg-white ring-4 ring-primary-600/10'}`}>
                    {!profile?.is_pro && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg shadow-primary-500/30 uppercase tracking-wider z-10">
                        Recommandé
                      </div>
                    )}
                    <div className="p-8 flex-1 relative overflow-hidden">
                      {/* Decorative background blob */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none"></div>

                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                          <h4 className="text-xl font-bold text-slate-900">Professionnel</h4>
                          <p className="text-slate-500 text-sm mt-1">Pour les experts de santé</p>
                        </div>
                        <div className={`p-2 rounded-xl ${profile?.is_pro ? 'bg-emerald-100 text-emerald-600' : 'bg-primary-100 text-primary-600'}`}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                      </div>
                      <div className="mb-6 flex items-baseline relative z-10">
                        <span className="text-4xl font-extrabold text-slate-900">29€</span>
                        <span className="text-slate-500 ml-2 font-medium">/ mois</span>
                      </div>
                      <hr className="border-slate-100 mb-6 relative z-10" />
                      <ul className="space-y-4 mb-8 relative z-10">
                        {[
                          { text: 'Factures illimitées', bold: true },
                          { text: 'Assistant IA illimité', bold: true },
                          { text: 'Modèles Premium & Personnalisation', bold: false },
                          { text: 'Support prioritaire 24/7', bold: false },
                          { text: 'Gestion multi-dossiers', bold: false },
                          { text: 'Export comptable', bold: false },
                        ].map((feature, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                            <div className={`p-0.5 rounded-full mt-0.5 ${profile?.is_pro ? 'bg-emerald-100 text-emerald-600' : 'bg-primary-100 text-primary-600'}`}>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <span className={feature.bold ? 'font-bold text-slate-900' : ''}>{feature.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-8 pt-0 mt-auto relative z-10">
                      {profile?.is_pro ? (
                        <div className="text-center bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                          <p className="text-emerald-800 font-semibold text-sm flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Vous êtes PRO
                          </p>
                        </div>
                      ) : (
                        <>
                          <Button
                            onClick={() => profile?.id && subscribeToPro(profile.id, profile?.email)}
                            className="w-full justify-center py-4 text-base shadow-lg hover:shadow-primary-500/25 transition-all bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 border-none"
                            disabled={isSaving}
                          >
                            Passer à PRO
                          </Button>
                          <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            Paiement sécurisé via Stripe
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-16 pt-10 border-t border-slate-200">
                  <h4 className="text-xl font-bold text-slate-900 mb-8 text-center">Questions Fréquentes</h4>
                  <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                    {[
                      { q: "Puis-je annuler à tout moment ?", a: "Oui, absolument. Vous pouvez annuler votre abonnement à tout moment depuis votre espace. L'accès PRO restera actif jusqu'à la fin de la période facturée." },
                      { q: "Comment fonctionne le paiement ?", a: "Les paiements sont sécurisés et traités par Stripe, le leader mondial du paiement en ligne. Nous ne stockons aucune information bancaire." },
                      { q: "J'ai besoin d'une facture", a: "Une facture est générée automatiquement à chaque paiement et envoyée par email. Vous pouvez aussi les retrouver dans votre espace de gestion d'abonnement." },
                      { q: "Qu'est-ce que l'IA illimitée ?", a: "Le plan PRO vous donne un accès illimité à notre assistant IA pour générer, analyser et optimiser vos factures sans aucune restriction journalière." }
                    ].map((item, i) => (
                      <div key={i}>
                        <h5 className="font-bold text-slate-900 mb-2 text-sm">{item.q}</h5>
                        <p className="text-slate-600 text-sm leading-relaxed">{item.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center max-w-2xl mx-auto mb-8">
                  <h3 className="text-3xl font-bold text-slate-900 mb-3">Sécurité & Confidentialité</h3>
                  <p className="text-slate-500 text-lg">Gérez vos données et la sécurité de votre compte.</p>
                </div>

                {/* Danger Zone */}
                <section className="bg-red-50 rounded-xl shadow-sm border border-red-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-red-100 bg-red-100/50">
                    <h4 className="font-semibold text-red-800 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      Zone de danger (RGPD)
                    </h4>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h5 className="font-medium text-red-900 mb-1">Supprimer mon compte</h5>
                        <p className="text-sm text-red-700">
                          Cette action est irréversible. Toutes vos données (factures, clients, paramètres) seront définitivement effacées conformément au RGPD.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 hover:border-red-300 shrink-0"
                        onClick={() => {
                          setDeleteConfirmation('');
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        Supprimer mon compte
                      </Button>
                    </div>
                  </div>
                </section>
              </div>
            )}

          </div>
        </main>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Supprimer votre compte ?"
        className="max-w-md"
      >
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-100 flex gap-3">
            <svg className="w-6 h-6 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <p className="text-sm text-red-800">
              Attention : cette action est <strong>définitive</strong>. Vous perdrez l'accès à toutes vos factures et données clients. Il n'y a pas de retour en arrière possible.
            </p>
          </div>

          <p className="text-slate-600 text-sm">
            Pour confirmer, veuillez taper <strong>supprimer</strong> ci-dessous.
          </p>

          <input
            type="text"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            placeholder="supprimer"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
          />

          <div className="flex gap-3 justify-end mt-6">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Annuler</Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white border-none"
              disabled={deleteConfirmation !== 'supprimer' || isDeleting}
              isLoading={isDeleting}
              onClick={handleDeleteAccount}
            >
              Supprimer définitivement
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
