'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '../types';
import { Button } from './ui/button';
import { Modal } from './ui/modal';
import { Field, Input, Textarea } from './ui/input';
import { Icon, IconName } from './ui/icon';
import { Stamp } from './ui/stamp';
import { ToastType } from './ui/toast';
import { manageSubscription, subscribeToPro, reactivateSubscription } from '../services/stripeService';
import { cn } from '@/lib/cn';
import { errorMessage } from '@/lib/errors';

type SettingsSection = 'general' | 'subscription' | 'security';

interface SettingsProps {
  profile: UserProfile | null;
  onUpdate: () => void;
  onClose: () => void;
  onShowToast: (message: string, type: ToastType) => void;
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
}

const SECTIONS: { id: SettingsSection; label: string; icon: IconName }[] = [
  { id: 'general', label: 'Profil et coordonnées', icon: 'user' },
  { id: 'subscription', label: 'Abonnement', icon: 'card' },
  { id: 'security', label: 'Sécurité et données', icon: 'lock' },
];

const FREE_FEATURES = ['3 factures par mois', 'Modèles standards', 'Export PDF', 'Support par email'];
const PRO_FEATURES = [
  { text: 'Factures illimitées', bold: true },
  { text: 'Dictée et assistant illimités', bold: true },
  { text: 'Tous les modèles de facture', bold: false },
  { text: 'Support prioritaire', bold: false },
  { text: 'Dossiers illimités', bold: false },
  { text: 'Export comptable', bold: false },
];

const SUBSCRIPTION_FAQ = [
  { q: 'Puis-je annuler à tout moment ?', a: 'Oui. Vous annulez depuis cette page ; l’accès Professionnel reste actif jusqu’à la fin de la période payée.' },
  { q: 'Comment fonctionne le paiement ?', a: 'Le paiement est traité par Stripe. Nous ne stockons aucune donnée bancaire.' },
  { q: 'Où trouver mes factures d’abonnement ?', a: 'Chaque paiement génère une facture envoyée par email. Vous les retrouvez aussi dans « Gérer l’abonnement ».' },
  { q: 'Que comprend la dictée illimitée ?', a: 'Vous dictez et remplissez autant de factures que nécessaire, sans quota journalier.' },
];

const Card = ({ title, description, children, className }: { title?: string; description?: string; children: React.ReactNode; className?: string }) => (
  <section className={cn('overflow-hidden rounded-2xl border border-rule bg-white', className)}>
    {title && (
      <div className="border-b border-rule px-5 py-4 sm:px-6">
        <h3 className="font-display text-[15px] font-semibold text-ink">{title}</h3>
        {description && <p className="mt-0.5 text-[13px] text-ink-soft">{description}</p>}
      </div>
    )}
    <div className="p-5 sm:p-6">{children}</div>
  </section>
);

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

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
      onShowToast('Profil enregistré', 'success');
    } catch (err) {
      console.error(err);
      onShowToast("Le profil n'a pas pu être enregistré : " + errorMessage(err), 'error');
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

      onShowToast('Compte supprimé', 'success');
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error(err);
      onShowToast("Le compte n'a pas pu être supprimé : " + errorMessage(err), 'error');
      setIsDeleting(false);
    }
  };

  const handleSubscriptionAction = async () => {
    if (!profile?.id) return;
    if (profile.cancel_at_period_end) {
      setIsSaving(true);
      try {
        await reactivateSubscription(profile.id);
        onUpdate();
        onShowToast('Abonnement réactivé', 'success');
      } catch (err) {
        onShowToast("L'abonnement n'a pas pu être réactivé : " + errorMessage(err), 'error');
      } finally {
        setIsSaving(false);
      }
    } else {
      manageSubscription(profile.id);
    }
  };

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
  );

  return (
    <div className="flex h-full w-full flex-col animate-in fade-in duration-300">
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-rule bg-white px-3 md:px-6">
        <div className="flex items-center gap-1">
          <button onClick={onClose} aria-label="Retour aux factures" className="rounded-lg p-2 text-ink-soft transition-colors hover:bg-paper md:hidden">
            <Icon name="chevronLeft" className="size-5" />
          </button>
          <h1 className="font-display text-base font-semibold text-ink">Paramètres</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onUpdate} aria-label="Actualiser les informations" title="Actualiser">
            <Icon name="refresh" />
          </Button>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSaving} className="hidden md:inline-flex">Fermer</Button>
          {activeSection === 'general' && (
            <Button size="sm" onClick={handleSave} isLoading={isSaving} disabled={!hasChanges || isSaving}>Enregistrer</Button>
          )}
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col overflow-hidden md:flex-row">
        <nav aria-label="Rubriques des paramètres" className="shrink-0 overflow-x-auto border-b border-rule bg-white scrollbar-none md:w-64 md:overflow-visible md:border-b-0 md:bg-transparent md:py-8">
          <ul className="flex min-w-max gap-1 p-2 md:min-w-0 md:flex-col md:px-4">
            {SECTIONS.map(section => {
              const isActive = activeSection === section.id;
              return (
                <li key={section.id}>
                  <button
                    onClick={() => onSectionChange(section.id)}
                    disabled={isSaving}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex w-full items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-50',
                      isActive ? 'bg-white font-medium text-ink ring-1 ring-rule md:shadow-[0_1px_2px_rgb(25_27_38/0.06)]' : 'text-ink-soft hover:bg-ink/5 hover:text-ink',
                    )}
                  >
                    <Icon name={section.icon} className={isActive ? 'text-primary-600' : 'text-ink-faint'} />
                    {section.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 lg:px-12">
          <div className="mx-auto max-w-3xl space-y-6 pb-20">

            {activeSection === 'general' && (
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink">Profil et coordonnées</h2>
                  <p className="mt-1 text-sm text-ink-soft">Ces informations figurent en en-tête de vos factures.</p>
                </div>

                <Card title="Identité professionnelle">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {textField('full_name', 'Nom complet ou raison sociale', { placeholder: 'Dr Martin Dupont', autoComplete: 'name' })}
                    {textField('specialty', 'Spécialité', { placeholder: 'Infirmier libéral' })}
                    {textField('adeli', 'N° ADELI / RPPS', { placeholder: '75 1 23456 7', className: 'font-mono' })}
                    {textField('siret', 'SIRET', { placeholder: '123 456 789 00012', className: 'font-mono', inputMode: 'numeric' })}
                  </div>
                </Card>

                <Card title="Cabinet">
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
                </Card>

                <Card>
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
                </Card>
              </form>
            )}

            {activeSection === 'subscription' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink">Abonnement</h2>
                  <p className="mt-1 text-sm text-ink-soft">Votre offre actuelle et vos options.</p>
                </div>

                {!profile?.is_pro && profile?.stripe_customer_id && (
                  <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <Icon name="alert" className="mt-0.5 size-5 text-amber-600" />
                    <div>
                      <h4 className="text-sm font-semibold text-amber-900">Votre abonnement Professionnel est terminé</h4>
                      <p className="mt-1 text-sm text-amber-800">Réabonnez-vous pour retrouver les factures illimitées. Votre historique est conservé.</p>
                    </div>
                  </div>
                )}

                {profile?.is_pro && (
                  <Card>
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-display text-lg font-semibold text-ink">Offre Professionnel</h3>
                          {profile.cancel_at_period_end
                            ? <Stamp tone="late" rotate={-2}>Se termine</Stamp>
                            : <Stamp tone="paid" rotate={-2}>Active</Stamp>}
                        </div>
                        <p className="mt-2 text-sm text-ink-soft">
                          {profile.current_period_end
                            ? <>{profile.cancel_at_period_end ? 'Accès jusqu’au ' : 'Prochain renouvellement le '}<strong className="font-medium text-ink">{formatDate(profile.current_period_end)}</strong></>
                            : profile.cancel_at_period_end ? 'Annulation programmée à la fin de la période en cours.' : 'Renouvellement mensuel.'}
                        </p>
                        <p className="mt-1 font-mono text-[13px] text-ink-soft">29,00 € / mois</p>
                      </div>
                      <Button onClick={handleSubscriptionAction} variant="outline" disabled={isSaving} className="md:w-auto">
                        {profile.cancel_at_period_end ? 'Réactiver l’abonnement' : 'Gérer l’abonnement'}
                      </Button>
                    </div>
                  </Card>
                )}

                <div className="grid items-stretch gap-4 md:grid-cols-2">
                  <article className="flex flex-col rounded-2xl border border-rule bg-paper p-6">
                    <h4 className="font-display text-lg font-semibold text-ink">Découverte</h4>
                    <p className="mt-1 text-sm text-ink-soft">Pour prendre l’outil en main.</p>
                    <p className="mt-5 flex items-baseline gap-1"><span className="font-display text-4xl font-semibold tabular text-ink">0 €</span><span className="text-sm text-ink-soft">/ mois</span></p>
                    <ul className="mt-6 space-y-2.5 border-t border-rule pt-5 text-sm text-ink">
                      {FREE_FEATURES.map(feature => (
                        <li key={feature} className="flex gap-2.5"><Icon name="check" className="mt-0.5 text-ink-faint" strokeWidth={2.5} />{feature}</li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-6">
                      <Button variant="outline" className="w-full" disabled>{profile?.is_pro ? 'Incluse' : 'Votre offre actuelle'}</Button>
                    </div>
                  </article>

                  <article className={cn('relative flex flex-col rounded-2xl border-2 bg-white p-6', profile?.is_pro ? 'border-vitale-600' : 'border-primary-600 shadow-sheet')}>
                    {!profile?.is_pro && <Stamp tone="ink" size="md" rotate={5} className="absolute -top-3.5 right-5 bg-white">Recommandé</Stamp>}
                    <h4 className="font-display text-lg font-semibold text-ink">Professionnel</h4>
                    <p className="mt-1 text-sm text-ink-soft">Pour les soignants en activité.</p>
                    <p className="mt-5 flex items-baseline gap-1"><span className="font-display text-4xl font-semibold tabular text-ink">29 €</span><span className="text-sm text-ink-soft">/ mois</span></p>
                    <ul className="mt-6 space-y-2.5 border-t border-rule pt-5 text-sm text-ink">
                      {PRO_FEATURES.map(feature => (
                        <li key={feature.text} className="flex gap-2.5">
                          <Icon name="check" className={cn('mt-0.5', profile?.is_pro ? 'text-vitale-600' : 'text-primary-600')} strokeWidth={2.5} />
                          <span className={feature.bold ? 'font-semibold' : undefined}>{feature.text}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-6">
                      {profile?.is_pro ? (
                        <p className="flex items-center justify-center gap-2 rounded-lg bg-vitale-50 py-2.5 text-sm font-medium text-vitale-700">
                          <Icon name="check" strokeWidth={2.5} />Votre offre actuelle
                        </p>
                      ) : (
                        <>
                          <Button onClick={() => profile?.id && subscribeToPro(profile.id, profile?.email)} className="w-full" size="lg" disabled={isSaving}>
                            Passer à l’offre Professionnel
                          </Button>
                          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-faint">
                            <Icon name="lock" className="size-3" />Paiement sécurisé par Stripe
                          </p>
                        </>
                      )}
                    </div>
                  </article>
                </div>

                <section className="pt-6">
                  <h3 className="mb-5 font-display text-[15px] font-semibold text-ink">Questions fréquentes</h3>
                  <dl className="grid gap-x-10 gap-y-6 md:grid-cols-2">
                    {SUBSCRIPTION_FAQ.map(item => (
                      <div key={item.q}>
                        <dt className="text-sm font-medium text-ink">{item.q}</dt>
                        <dd className="mt-1.5 text-sm leading-relaxed text-ink-soft">{item.a}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink">Sécurité et données</h2>
                  <p className="mt-1 text-sm text-ink-soft">Gérez vos données personnelles et votre compte.</p>
                </div>

                <section className="rounded-2xl border border-red-200 bg-white">
                  <div className="border-b border-red-100 px-5 py-4 sm:px-6">
                    <h3 className="font-display text-[15px] font-semibold text-red-800">Supprimer le compte</h3>
                  </div>
                  <div className="flex flex-col gap-4 p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
                    <p className="max-w-md text-sm leading-relaxed text-ink-soft">
                      Vos factures, patients et paramètres seront définitivement effacés, conformément au RGPD. Téléchargez les PDF dont vous avez besoin avant de continuer.
                    </p>
                    <Button
                      variant="outline"
                      className="shrink-0 border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50"
                      onClick={() => {
                        setDeleteConfirmation('');
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      Supprimer mon compte
                    </Button>
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
        title="Supprimer définitivement votre compte ?"
        className="max-w-md"
      >
        <p className="text-sm leading-relaxed text-ink-soft">
          Toutes vos factures et données patients seront effacées. Il ne sera pas possible de les récupérer.
        </p>
        <Field label={<>Tapez <strong className="font-semibold text-ink">supprimer</strong> pour confirmer</>} htmlFor="delete-confirmation" className="mt-5">
          <Input
            id="delete-confirmation"
            type="text"
            placeholder="supprimer"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            autoComplete="off"
            className="focus:border-red-600 focus:ring-red-600/12"
          />
        </Field>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Annuler</Button>
          <Button
            variant="danger"
            disabled={deleteConfirmation !== 'supprimer' || isDeleting}
            isLoading={isDeleting}
            onClick={handleDeleteAccount}
          >
            Supprimer mon compte
          </Button>
        </div>
      </Modal>
    </div>
  );
};
