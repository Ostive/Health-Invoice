'use client'

import React, { useState } from 'react';
import { useDashboard } from './DashboardContext';
import { Button } from '../ui/button';
import { PatientInput } from '../../lib/schemas';
import { PatientService } from '../../services/patientService';

export const PatientsView = () => {
    const { patients, refreshPatients, setToast, user } = useDashboard();
    const [isBusy, setIsBusy] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingPatient, setEditingPatient] = useState<PatientInput | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState<string | null>(null);

    // Filter patients
    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone?.includes(searchTerm) ||
        p.ssn?.includes(searchTerm) ||
        p.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDeleteClick = (id: string) => {
        setPatientToDelete(id);
    };

    const confirmDelete = async () => {
        if (!patientToDelete) return;

        setIsBusy(true);
        try {
            await PatientService.delete(patientToDelete);
            await refreshPatients();
            setToast({ message: 'Patient supprimé', type: 'success' });
        } catch (err: any) {
            setToast({ message: `Erreur: ${err.message}`, type: 'error' });
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

    const [displayLimit, setDisplayLimit] = useState(24);

    // Reset limit when search changes
    React.useEffect(() => {
        setDisplayLimit(24);
    }, [searchTerm]);

    const visiblePatients = filteredPatients.slice(0, displayLimit);
    const hasMore = filteredPatients.length > displayLimit;

    const handleLoadMore = () => {
        setDisplayLimit(prev => prev + 24);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <header className="h-auto min-h-[4rem] bg-white border-b border-slate-200 flex flex-wrap md:flex-nowrap items-center justify-between px-4 md:px-6 py-2 md:py-0 shrink-0 sticky top-0 z-10 gap-2 md:gap-0">
                <h1 className="text-lg font-bold text-slate-900 hidden md:block">Patients</h1>
                <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                    <div className="relative flex-1 md:flex-none">
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-full md:w-64"
                        />
                        <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <Button onClick={handleAddNew} className="flex items-center gap-2 shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        <span className="hidden sm:inline">Nouveau Patient</span>
                    </Button>
                </div>
            </header>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6">
                {filteredPatients.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <h3 className="text-slate-900 font-medium mb-1">Aucun patient trouvé</h3>
                        <p className="text-slate-500 text-sm">Commencez par ajouter votre premier patient.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {visiblePatients.map(patient => (
                                <div key={patient.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-sm">
                                                {patient.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900">{patient.name}</h3>
                                                <p className="text-xs text-slate-500">{patient.email || 'Sans email'}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(patient)} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </button>
                                            <button onClick={() => patient.id && handleDeleteClick(patient.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm text-slate-600">
                                        {patient.phone && (
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                {patient.phone}
                                            </div>
                                        )}
                                        {patient.address && (
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                <span className="truncate">{patient.address}</span>
                                            </div>
                                        )}
                                        {patient.ssn && (
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                                                <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                                                    {patient.ssn}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {hasMore && (
                            <div className="flex justify-center mt-6">
                                <Button variant="outline" onClick={handleLoadMore}>
                                    Afficher plus de patients
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Edit/Create Modal */}
            {isModalOpen && (
                <PatientModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    patient={editingPatient}
                    onSuccess={refreshPatients}
                />
            )}

            {/* Delete Confirmation Modal */}
            {patientToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 text-center mb-2">Supprimer le patient ?</h3>
                        <p className="text-sm text-slate-500 text-center mb-6">Cette action est irréversible. Le patient sera définitivement effacé.</p>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setPatientToDelete(null)} className="flex-1 justify-center" disabled={isBusy}>Annuler</Button>
                            <Button onClick={confirmDelete} className="flex-1 justify-center bg-red-600 hover:bg-red-700 text-white" isLoading={isBusy}>Supprimer</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Simple Modal Component for Patients
const PatientModal = ({ isOpen, onClose, patient, onSuccess }: { isOpen: boolean, onClose: () => void, patient: PatientInput | null, onSuccess: () => void }) => {
    const { user, setToast } = useDashboard();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<PatientInput>(patient || {
        name: '',
        email: '',
        phone: '',
        address: '',
        ssn: '',
        notes: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;

        setIsLoading(true);
        try {
            if (patient?.id) {
                await PatientService.update(patient.id, formData);
                setToast({ message: 'Patient mis à jour', type: 'success' });
            } else {
                await PatientService.create(formData);
                setToast({ message: 'Patient créé', type: 'success' });
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setToast({ message: `Erreur: ${err.message}`, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-900">{patient ? 'Modifier le patient' : 'Nouveau patient'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet *</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Ex: Jean Dupont"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={formData.email || ''}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="jean@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                            <input
                                type="tel"
                                value={formData.phone || ''}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="06 12 34 56 78"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
                        <textarea
                            value={formData.address || ''}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            rows={2}
                            placeholder="Adresse complète"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Numéro de Sécurité Sociale</label>
                        <input
                            type="text"
                            value={formData.ssn || ''}
                            onChange={e => setFormData({ ...formData, ssn: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono"
                            placeholder="1 85 05 ..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                        <textarea
                            value={formData.notes || ''}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            rows={2}
                            placeholder="Notes internes..."
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Annuler</Button>
                        <Button type="submit" isLoading={isLoading}>Enregistrer</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
