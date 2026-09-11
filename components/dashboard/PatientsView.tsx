'use client'

import React, { useState } from 'react';
import { useDashboard } from './DashboardContext';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Field, Input, Textarea } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import type { PatientInput } from '@/lib/schemas';
import { PatientService } from '@/services/patientService';
import { cn } from '@/lib/cn';
import { errorMessage } from '@/lib/errors';

const PAGE_SIZE = 24;

export const PatientsView = () => {
    const { patients, refreshPatients, setToast } = useDashboard();
    const [isBusy, setIsBusy] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingPatient, setEditingPatient] = useState<PatientInput | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState<string | null>(null);
    const [displayLimit, setDisplayLimit] = useState(PAGE_SIZE);

    const query = searchTerm.toLowerCase();
    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.email?.toLowerCase().includes(query) ||
        p.phone?.includes(searchTerm) ||
        p.ssn?.includes(searchTerm) ||
        p.address?.toLowerCase().includes(query)
    );

    // Reset pagination when the search changes
    React.useEffect(() => {
        setDisplayLimit(PAGE_SIZE);
    }, [searchTerm]);

    const visiblePatients = filteredPatients.slice(0, displayLimit);
    const hasMore = filteredPatients.length > displayLimit;

    const confirmDelete = async () => {
        if (!patientToDelete) return;

        setIsBusy(true);
        try {
            await PatientService.delete(patientToDelete);
            await refreshPatients();
            setToast({ message: 'Patient supprimé', type: 'success' });
        } catch (err) {
            setToast({ message: `Le patient n'a pas pu être supprimé : ${errorMessage(err)}`, type: 'error' });
        } finally {
            setIsBusy(false);
            setPatientToDelete(null);
        }
    };

    const handleEdit = (patient: PatientInput) => {
        setEditingPatient(patient);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingPatient(null);
        setIsModalOpen(true);
    };

    const patientPendingDeletion = patients.find(p => p.id === patientToDelete);

    return (
        <div className="flex h-full flex-col">
            <header className="sticky top-0 z-10 flex min-h-16 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-rule bg-white px-3 py-2.5 md:flex-nowrap md:px-6">
                <div className="hidden items-baseline gap-2 md:flex">
                    <h1 className="font-display text-base font-semibold text-ink">Patients</h1>
                    <span className="font-mono text-xs text-ink-faint">{patients.length}</span>
                </div>
                <div className="flex w-full items-center gap-2 md:w-auto">
                    <div className="relative flex-1 md:w-72 md:flex-none">
                        <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                        <Input
                            type="search"
                            placeholder="Nom, téléphone, n° de sécu…"
                            aria-label="Rechercher un patient"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="py-2 pl-9"
                        />
                    </div>
                    <Button onClick={handleAddNew} className="shrink-0">
                        <Icon name="plus" strokeWidth={2.25} />
                        <span className="hidden sm:inline">Nouveau patient</span>
                        <span className="sr-only sm:hidden">Nouveau patient</span>
                    </Button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {filteredPatients.length === 0 ? (
                    <div className="mx-auto max-w-sm py-16 text-center">
                        <span className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-white ring-1 ring-rule">
                            <Icon name="users" className="size-6 text-ink-faint" />
                        </span>
                        {searchTerm ? (
                            <>
                                <h3 className="font-display font-semibold text-ink">Aucun patient trouvé</h3>
                                <p className="mt-1 text-sm text-ink-soft">Aucun résultat pour « {searchTerm} ». Vérifiez l’orthographe ou cherchez par téléphone.</p>
                            </>
                        ) : (
                            <>
                                <h3 className="font-display font-semibold text-ink">Votre fichier patients est vide</h3>
                                <p className="mt-1 text-sm text-ink-soft">Ajoutez vos patients pour les retrouver en un clic au moment de facturer.</p>
                                <Button onClick={handleAddNew} variant="outline" className="mt-5">
                                    <Icon name="plus" strokeWidth={2.25} />Ajouter un patient
                                </Button>
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {visiblePatients.map(patient => (
                                <li key={patient.id} className="group relative rounded-xl border border-rule bg-white p-4 transition-shadow hover:shadow-sheet">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-50 font-display text-xs font-semibold text-primary-700 ring-1 ring-primary-100" aria-hidden="true">
                                                {patient.name.substring(0, 2).toUpperCase()}
                                            </span>
                                            <div className="min-w-0">
                                                <h3 className="truncate font-medium text-ink">{patient.name}</h3>
                                                <p className="truncate text-[13px] text-ink-soft">{patient.email || 'Pas d’email'}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-0.5 transition-opacity focus-within:opacity-100 md:opacity-0 md:group-hover:opacity-100">
                                            <button onClick={() => handleEdit(patient)} aria-label={`Modifier ${patient.name}`} className="grid size-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-paper hover:text-primary-600">
                                                <Icon name="edit" />
                                            </button>
                                            <button onClick={() => patient.id && setPatientToDelete(patient.id)} aria-label={`Supprimer ${patient.name}`} className="grid size-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-red-50 hover:text-red-600">
                                                <Icon name="trash" />
                                            </button>
                                        </div>
                                    </div>
                                    {(patient.phone || patient.address || patient.ssn) && (
                                        <dl className="mt-4 space-y-2 border-t border-rule pt-3 text-[13px] text-ink-soft">
                                            {patient.phone && (
                                                <div className="flex items-center gap-2">
                                                    <dt><Icon name="phone" className="text-ink-faint" /><span className="sr-only">Téléphone</span></dt>
                                                    <dd className="font-mono">{patient.phone}</dd>
                                                </div>
                                            )}
                                            {patient.address && (
                                                <div className="flex items-center gap-2">
                                                    <dt><Icon name="pin" className="text-ink-faint" /><span className="sr-only">Adresse</span></dt>
                                                    <dd className="truncate">{patient.address}</dd>
                                                </div>
                                            )}
                                            {patient.ssn && (
                                                <div className="flex items-center gap-2">
                                                    <dt><Icon name="id" className="text-ink-faint" /><span className="sr-only">N° de sécurité sociale</span></dt>
                                                    <dd className="font-mono text-xs text-ink">{patient.ssn}</dd>
                                                </div>
                                            )}
                                        </dl>
                                    )}
                                </li>
                            ))}
                        </ul>
                        {hasMore && (
                            <div className="mt-6 flex justify-center">
                                <Button variant="outline" onClick={() => setDisplayLimit(prev => prev + PAGE_SIZE)}>
                                    Afficher plus de patients
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {isModalOpen && (
                <PatientModal
                    onClose={() => setIsModalOpen(false)}
                    patient={editingPatient}
                    onSuccess={refreshPatients}
                />
            )}

            <Modal isOpen={!!patientToDelete} onClose={() => setPatientToDelete(null)} title="Supprimer ce patient ?">
                <p className="text-sm leading-relaxed text-ink-soft">
                    <strong className="font-medium text-ink">{patientPendingDeletion?.name}</strong> sera retiré de votre fichier. Les factures déjà émises sont conservées.
                </p>
                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button variant="ghost" onClick={() => setPatientToDelete(null)} disabled={isBusy}>Annuler</Button>
                    <Button variant="danger" onClick={confirmDelete} isLoading={isBusy}>Supprimer le patient</Button>
                </div>
            </Modal>
        </div>
    );
};

const PatientModal = ({ onClose, patient, onSuccess }: { onClose: () => void, patient: PatientInput | null, onSuccess: () => void }) => {
    const { setToast } = useDashboard();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<PatientInput>(patient || {
        name: '',
        email: '',
        phone: '',
        address: '',
        ssn: '',
        notes: ''
    });

    const update = (field: keyof PatientInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setFormData({ ...formData, [field]: e.target.value });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (patient?.id) {
                await PatientService.update(patient.id, formData);
                setToast({ message: 'Patient enregistré', type: 'success' });
            } else {
                await PatientService.create(formData);
                setToast({ message: 'Patient ajouté', type: 'success' });
            }
            onSuccess();
            onClose();
        } catch (err) {
            setToast({ message: `Le patient n'a pas pu être enregistré : ${errorMessage(err)}`, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen onClose={onClose} title={patient ? 'Modifier le patient' : 'Nouveau patient'} className="max-w-lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="Nom complet" htmlFor="patient-name">
                    <Input id="patient-name" required type="text" value={formData.name} onChange={update('name')} placeholder="Jean Dupont" autoFocus />
                </Field>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Email" htmlFor="patient-email">
                        <Input id="patient-email" type="email" value={formData.email || ''} onChange={update('email')} placeholder="jean@exemple.fr" />
                    </Field>
                    <Field label="Téléphone" htmlFor="patient-phone">
                        <Input id="patient-phone" type="tel" value={formData.phone || ''} onChange={update('phone')} placeholder="06 12 34 56 78" />
                    </Field>
                </div>
                <Field label="Adresse" htmlFor="patient-address">
                    <Textarea id="patient-address" value={formData.address || ''} onChange={update('address')} rows={2} placeholder="12 rue de la Paix, 75002 Paris" />
                </Field>
                <Field label="N° de sécurité sociale" htmlFor="patient-ssn" hint="Chiffré avant d’être enregistré.">
                    <Input id="patient-ssn" type="text" inputMode="numeric" value={formData.ssn || ''} onChange={update('ssn')} placeholder="1 85 05 75 123 456 78" className={cn('font-mono')} />
                </Field>
                <Field label="Notes" htmlFor="patient-notes" hint="Visibles par vous seul.">
                    <Textarea id="patient-notes" value={formData.notes || ''} onChange={update('notes')} rows={2} />
                </Field>
                <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                    <Button variant="ghost" onClick={onClose} disabled={isLoading}>Annuler</Button>
                    <Button type="submit" isLoading={isLoading}>{patient ? 'Enregistrer' : 'Ajouter le patient'}</Button>
                </div>
            </form>
        </Modal>
    );
};
