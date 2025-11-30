'use client'

import React, { useState, useEffect, useRef } from 'react';
import { OnboardingModal } from './OnboardingModal';
import { useRouter } from 'next/navigation';
import { Invoice, InvoiceStatus, UserProfile, Folder } from '../types/index';
import { InvoiceEditor } from './InvoiceEditor';
import { InvoicePreview } from './InvoicePreview';
import { Button } from './ui/button';
import { LegalPageType } from './Legal';
import { subscribeToPro, PLAN_LIMITS } from '../services/stripeService';
import { InvoiceService } from '../services/invoiceService';
import { Settings } from './Settings';
import { Toast, ToastType } from './ui/toast';
import { User } from '@supabase/supabase-js';

// Imported Components
import { Sidebar } from './dashboard/Sidebar';
import { DeleteConfirmationModal } from './dashboard/modals/DeleteConfirmationModal';
import { FolderModal } from './dashboard/modals/FolderModal';
import { DeleteFolderConfirmationModal } from './dashboard/modals/DeleteFolderConfirmationModal';

// Polyfill for crypto.randomUUID
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

interface DashboardProps {
  onLogout: () => void;
  user: User;
  onOpenLegal: (type: LegalPageType) => void;
  profile: UserProfile | null;
  onProfileUpdate: () => void;
  showSettings?: boolean;
  settingsSection?: 'general' | 'subscription';
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout, user, onOpenLegal, profile, onProfileUpdate, showSettings, settingsSection }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<Set<string>>(new Set());
  const [selectedFolderIds, setSelectedFolderIds] = useState<Set<string>>(new Set());
  const [isDeletingInvoice, setIsDeletingInvoice] = useState(false);
  const [isSavingFolder, setIsSavingFolder] = useState(false);
  const [isDeletingFolder, setIsDeletingFolder] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [folderToEdit, setFolderToEdit] = useState<Folder | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [folderSearchQuery, setFolderSearchQuery] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Data
  const fetchInvoices = async (force = false) => {
    if (!user?.id) return;
    setIsLoadingList(true);
    setFetchError(null);
    try {
      const data = await InvoiceService.fetchAll(user.id);
      setInvoices(data);
    } catch (err: any) {
      setFetchError(err.message);
    } finally {
      setIsLoadingList(false);
    }
  };

  const fetchFolders = async () => {
    if (!user?.id) return;
    try {
      const data = await InvoiceService.fetchFolders(user.id);
      setFolders(data);
    } catch (err) {
      console.error("Error fetching folders:", err);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchInvoices();
      fetchFolders();
    }
  }, [user?.id]);

  useEffect(() => {
    if (profile && !profile.full_name) {
      setShowOnboarding(true);
    }
  }, [profile]);

  const toggleInvoiceSelection = (id: string) => {
    const newSelection = new Set(selectedInvoiceIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedInvoiceIds(newSelection);
  };

  const toggleFolderSelection = (id: string) => {
    const newSelection = new Set(selectedFolderIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedFolderIds(newSelection);
  };

  // Filter invoices based on selected folder, Search Query and Date Range
  const displayedInvoices = invoices.filter(i => {
    // Folder Filter
    if (selectedFolderId && i.folderId !== selectedFolderId) return false;

    // Date Filter
    if (dateRange.start && i.date < dateRange.start) return false;
    if (dateRange.end && i.date > dateRange.end) return false;

    // Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = i.client.name.toLowerCase().includes(q);
      const matchNumber = i.number.toLowerCase().includes(q);
      return matchName || matchNumber;
    }
    return true;
  });

  const toggleSelectAll = () => {
    if (selectedInvoiceIds.size === displayedInvoices.length) {
      setSelectedInvoiceIds(new Set());
    } else {
      setSelectedInvoiceIds(new Set(displayedInvoices.map(i => i.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedInvoiceIds.size === 0) return;
    if (!confirm(`Voulez-vous vraiment supprimer ${selectedInvoiceIds.size} factures ?`)) return;

    setIsDeletingInvoice(true);
    try {
      await InvoiceService.deleteMultiple(Array.from(selectedInvoiceIds));

      const remaining = invoices.filter(i => !selectedInvoiceIds.has(i.id));
      setInvoices(remaining);

      if (currentInvoice && selectedInvoiceIds.has(currentInvoice.id)) {
        setCurrentInvoice(remaining.length > 0 ? remaining[0] : createEmptyInvoice());
      }

      setSelectedInvoiceIds(new Set());
      setToast({ message: `${selectedInvoiceIds.size} factures supprimées`, type: 'success' });
    } catch (err: any) {
      setToast({ message: `Erreur: ${err.message}`, type: 'error' });
      fetchInvoices(true);
    } finally {
      setIsDeletingInvoice(false);
    }
  };

  const handleBulkDeleteFolders = async () => {
    if (selectedFolderIds.size === 0) return;
    if (!confirm(`Voulez-vous vraiment supprimer ${selectedFolderIds.size} dossiers ?\nLes factures à l'intérieur ne seront pas supprimées.`)) return;

    setIsDeletingFolder(true);
    try {
      await InvoiceService.deleteMultipleFolders(Array.from(selectedFolderIds));

      setFolders(prev => prev.filter(f => !selectedFolderIds.has(f.id)));

      if (selectedFolderId && selectedFolderIds.has(selectedFolderId)) {
        setSelectedFolderId(null);
      }

      setSelectedFolderIds(new Set());
      setToast({ message: `${selectedFolderIds.size} dossiers supprimés`, type: 'success' });
    } catch (err: any) {
      setToast({ message: `Erreur: ${err.message}`, type: 'error' });
      fetchFolders();
    } finally {
      setIsDeletingFolder(false);
    }
  };

  const createEmptyInvoice = (): Invoice => {
    const year = new Date().getFullYear();
    const count = invoices.filter(i => i.date.startsWith(`${year}`)).length;
    const nextNumber = `${year}-${String(count + 1).padStart(3, '0')}`;

    return {
      id: generateUUID(),
      number: nextNumber,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      client: { name: '', address: '', email: '', ssn: '' },
      items: [{ id: generateUUID(), description: 'Consultation', quantity: 1, unitPrice: 25.00 }],
      status: InvoiceStatus.DRAFT,
      template: 'modern',
      notes: '',
      folderId: selectedFolderId || null
    };
  };

  const handleSave = async () => {
    if (!currentInvoice || !user?.id) return;
    setIsSaving(true);
    try {
      const savedInvoice = await InvoiceService.save(currentInvoice, user.id);
      setInvoices(prev => {
        const exists = prev.find(i => i.id === savedInvoice.id);
        return exists
          ? prev.map(i => i.id === savedInvoice.id ? savedInvoice : i)
          : [savedInvoice, ...prev];
      });
      setCurrentInvoice(savedInvoice);
      setToast({ message: 'Facture sauvegardée avec succès', type: 'success' });
    } catch (error: any) {
      setToast({ message: `Erreur de sauvegarde: ${error.message}`, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateFolderClick = () => {
    setFolderToEdit(null);
    setShowCreateFolderModal(true);
  };

  const handleEditFolder = (folder: Folder, e: React.MouseEvent) => {
    e.stopPropagation();
    setFolderToEdit(folder);
    setShowCreateFolderModal(true);
  };

  const handleDeleteFolder = (folder: Folder, e: React.MouseEvent) => {
    e.stopPropagation();
    setFolderToDelete(folder);
  };

  const confirmFolderAction = async (name: string, color: string) => {
    if (!user?.id) return;
    setIsSavingFolder(true);
    try {
      if (folderToEdit) {
        const updated = await InvoiceService.updateFolder(folderToEdit.id, name, color);
        setFolders(prev => prev.map(f => f.id === updated.id ? updated : f));
        setToast({ message: 'Dossier modifié', type: 'success' });
      } else {
        const created = await InvoiceService.createFolder(user.id, name, color);
        setFolders(prev => [...prev, created]);
        setToast({ message: 'Dossier créé', type: 'success' });
      }
      setShowCreateFolderModal(false);
      setFolderToEdit(null);
    } catch (err: any) {
      setToast({ message: `Erreur: ${err.message}`, type: 'error' });
    } finally {
      setIsSavingFolder(false);
    }
  };

  const confirmDeleteFolder = async () => {
    if (!folderToDelete) return;
    setIsDeletingFolder(true);
    try {
      await InvoiceService.deleteFolder(folderToDelete.id);
      setFolders(prev => prev.filter(f => f.id !== folderToDelete.id));
      if (selectedFolderId === folderToDelete.id) setSelectedFolderId(null);
      setToast({ message: 'Dossier supprimé', type: 'success' });
      setFolderToDelete(null);
    } catch (err: any) {
      setToast({ message: `Erreur: ${err.message}`, type: 'error' });
    } finally {
      setIsDeletingFolder(false);
    }
  };

  const isBusy = isSaving || isDeletingInvoice || isExporting || isSavingFolder || isDeletingFolder;

  const handleNewInvoice = () => {
    if (isBusy) return;
    if (!profile?.is_pro && invoices.length >= PLAN_LIMITS.free.maxInvoices) {
      setShowUpgradeModal(true);
      return;
    }
    const newInv = createEmptyInvoice();
    setCurrentInvoice(newInv);
    setActiveTab('editor');
    setIsMobileSidebarOpen(false);
  };

  const handleInvoiceSelect = (inv: Invoice) => {
    if (isBusy) return;
    setCurrentInvoice(inv);
    localStorage.setItem('lastOpenedInvoiceId', inv.id);
    setIsMobileSidebarOpen(false);
    setActiveTab('editor'); // Auto switch to editor on mobile
  };

  const confirmDelete = async () => {
    if (!invoiceToDelete) return;
    setIsDeletingInvoice(true);
    try {
      await InvoiceService.delete(invoiceToDelete);

      const remaining = invoices.filter(i => i.id !== invoiceToDelete);
      setInvoices(remaining);

      if (currentInvoice?.id === invoiceToDelete) {
        setCurrentInvoice(remaining.length > 0 ? remaining[0] : createEmptyInvoice());
      }
      setInvoiceToDelete(null); // Close modal on success
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
      fetchInvoices(true);
      setInvoiceToDelete(null); // Close modal on error too? Or keep open? Usually close or show error.
    } finally {
      setIsDeletingInvoice(false);
    }
  };

  const promptDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBusy) return;
    setInvoiceToDelete(id);
  };

  const handleStartUpgrade = () => {
    setShowUpgradeModal(false);
    subscribeToPro(user.id, user.email); // Direct redirect with email
  };

  const handleOpenSubscription = () => {
    router.push('/dashboard/subscription');
  };

  const handlePrint = () => {
    if (isBusy) return;
    try {
      window.print();
    } catch (error) {
      alert("Erreur impression. Utilisez Ctrl+P.");
    }
  };

  const handleDownloadPDF = async () => {
    if (!currentInvoice || isBusy) return;

    // Validation: Check for required fields
    if (!currentInvoice.number?.trim() || !currentInvoice.client.name?.trim()) {
      setToast({
        message: "Veuillez renseigner le numéro de facture et le nom du client pour télécharger le PDF.",
        type: 'error'
      });
      return;
    }

    setIsExporting(true);
    try {
      // Send invoice data and profile to the API
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice: currentInvoice,
          profile: profile
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to generate PDF';
        try {
          const errorData = await response.json();
          if (errorData?.error) {
            errorMessage = typeof errorData.error === 'string'
              ? errorData.error
              : JSON.stringify(errorData.error);
          }
          console.error('PDF Generation Error Response:', errorData);
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Facture-${currentInvoice.number}-${(currentInvoice.client.name || 'Client').replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setToast({ message: 'PDF téléchargé avec succès', type: 'success' });
    } catch (err: any) {
      console.error('PDF Download Error:', err);
      // If server-side PDF generation fails, fallback to client-side or show a helpful message
      // For now, let's just show the error message from the server
      const message = err instanceof Error ? err.message : 'Une erreur est survenue';
      setToast({ message: `Erreur PDF: ${message}`, type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenSettings = () => {
    if (isBusy) return;
    setIsMobileSidebarOpen(false);
    setUserMenuOpen(false);
    router.push('/dashboard/parameter');
  };

  const handleCloseSettings = () => {
    router.push('/dashboard');
  };

  const handleSectionChange = (section: 'general' | 'subscription') => {
    if (section === 'general') {
      router.push('/dashboard/parameter');
    } else {
      router.push('/dashboard/subscription');
    }
  };

  return (
    <div className="flex h-full bg-slate-50 overflow-hidden relative">
      <DeleteConfirmationModal isOpen={!!invoiceToDelete} onClose={() => setInvoiceToDelete(null)} onConfirm={confirmDelete} isLoading={isDeletingInvoice} />
      <DeleteFolderConfirmationModal isOpen={!!folderToDelete} onClose={() => setFolderToDelete(null)} onConfirm={confirmDeleteFolder} folderName={folderToDelete?.name || ''} isLoading={isDeletingFolder} />
      <FolderModal isOpen={showCreateFolderModal} onClose={() => { setShowCreateFolderModal(false); setFolderToEdit(null); }} onConfirm={confirmFolderAction} initialData={folderToEdit ? { name: folderToEdit.name, color: folderToEdit.color || 'blue' } : undefined} isLoading={isSavingFolder} />

      {showUpgradeModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Passez à la vitesse supérieure</h2>
            <p className="text-slate-600 mb-6">Vous avez atteint la limite de {PLAN_LIMITS.free.maxInvoices} factures gratuites. Passez au plan PRO pour des factures illimitées et l'accès complet à l'IA.</p>
            <div className="space-y-3"><Button onClick={handleStartUpgrade} className="w-full py-3 text-lg">Devenir PRO - 29€/mois</Button><button onClick={() => setShowUpgradeModal(false)} className="text-slate-400 text-sm hover:text-slate-600">Non merci, je reste limité</button></div>
          </div>
        </div>
      )}
      <aside className="hidden lg:block w-72 shrink-0 z-20 h-full shadow-xl shadow-slate-200/50">
        <Sidebar
          profile={profile}
          invoices={invoices}
          handleNewInvoice={handleNewInvoice}
          isBusy={isBusy}
          selectedFolderIds={selectedFolderIds}
          handleBulkDeleteFolders={handleBulkDeleteFolders}
          handleCreateFolderClick={handleCreateFolderClick}
          folderSearchQuery={folderSearchQuery}
          setFolderSearchQuery={setFolderSearchQuery}
          setSelectedFolderId={setSelectedFolderId}
          selectedFolderId={selectedFolderId}
          folders={folders}
          toggleFolderSelection={toggleFolderSelection}
          handleEditFolder={handleEditFolder}
          handleDeleteFolder={handleDeleteFolder}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showDateFilter={showDateFilter}
          setShowDateFilter={setShowDateFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
          selectedInvoiceIds={selectedInvoiceIds}
          displayedInvoices={displayedInvoices}
          toggleSelectAll={toggleSelectAll}
          handleBulkDelete={handleBulkDelete}
          isDeletingInvoice={isDeletingInvoice}
          isLoadingList={isLoadingList}
          fetchError={fetchError}
          handleInvoiceSelect={handleInvoiceSelect}
          currentInvoice={currentInvoice}
          showSettings={showSettings}
          toggleInvoiceSelection={toggleInvoiceSelection}
          promptDelete={promptDelete}
          setShowUpgradeModal={setShowUpgradeModal}
          userMenuRef={userMenuRef}
          userMenuOpen={userMenuOpen}
          setUserMenuOpen={setUserMenuOpen}
          user={user}
          handleOpenSettings={handleOpenSettings}
          onLogout={onLogout}
        />
      </aside>
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsMobileSidebarOpen(false)}></div>
          <div className="relative w-72 bg-white h-full shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
            {/* Mobile Sidebar Inner Content */}
            <div className="h-full flex flex-col">
              <Sidebar
                onClose={() => setIsMobileSidebarOpen(false)}
                profile={profile}
                invoices={invoices}
                handleNewInvoice={handleNewInvoice}
                isBusy={isBusy}
                selectedFolderIds={selectedFolderIds}
                handleBulkDeleteFolders={handleBulkDeleteFolders}
                handleCreateFolderClick={handleCreateFolderClick}
                folderSearchQuery={folderSearchQuery}
                setFolderSearchQuery={setFolderSearchQuery}
                setSelectedFolderId={setSelectedFolderId}
                selectedFolderId={selectedFolderId}
                folders={folders}
                toggleFolderSelection={toggleFolderSelection}
                handleEditFolder={handleEditFolder}
                handleDeleteFolder={handleDeleteFolder}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                showDateFilter={showDateFilter}
                setShowDateFilter={setShowDateFilter}
                dateRange={dateRange}
                setDateRange={setDateRange}
                selectedInvoiceIds={selectedInvoiceIds}
                displayedInvoices={displayedInvoices}
                toggleSelectAll={toggleSelectAll}
                handleBulkDelete={handleBulkDelete}
                isDeletingInvoice={isDeletingInvoice}
                isLoadingList={isLoadingList}
                fetchError={fetchError}
                handleInvoiceSelect={handleInvoiceSelect}
                currentInvoice={currentInvoice}
                showSettings={showSettings}
                toggleInvoiceSelection={toggleInvoiceSelection}
                promptDelete={promptDelete}
                setShowUpgradeModal={setShowUpgradeModal}
                userMenuRef={userMenuRef}
                userMenuOpen={userMenuOpen}
                setUserMenuOpen={setUserMenuOpen}
                user={user}
                handleOpenSettings={handleOpenSettings}
                onLogout={onLogout}
              />
              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-slate-700">Mon Compte</span>
                  {profile?.is_pro && <span className="bg-primary-100 text-primary-800 text-xs px-2 py-0.5 rounded-full font-bold">PRO</span>}
                </div>
                <Button variant="outline" className="w-full justify-center mb-2" onClick={handleOpenSettings}>Paramètres</Button>
                <Button variant="outline" className="w-full justify-center text-red-600 border-red-100 hover:bg-red-50" onClick={onLogout}>Déconnexion</Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0 bg-slate-100/50">
        {!showSettings && (
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shrink-0 z-10 sticky top-0">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsMobileSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg></button>
              <div className="flex flex-col"><h1 className="text-sm font-bold text-slate-900 truncate hidden sm:block">{currentInvoice ? (currentInvoice.client.name || `Facture ${currentInvoice.number}`) : 'Tableau de bord'}</h1></div>
              <h1 className="text-lg font-semibold text-slate-800 truncate sm:hidden">Facturier.ai</h1>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              {invoiceToDelete ? <span className="text-sm text-red-500 font-medium animate-pulse">Suppression en cours...</span> : (
                <>
                  <Button variant="outline" size="sm" onClick={() => setCurrentInvoice(null)} className="hidden md:flex items-center gap-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 border-slate-200" disabled={isSaving || isDeletingInvoice}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    Fermer
                  </Button>
                  {currentInvoice && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => promptDelete(currentInvoice.id, e)}
                      className="hidden md:flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                      disabled={isSaving || isDeletingInvoice}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Supprimer
                    </Button>
                  )}
                  <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block"></div>
                  <Button onClick={handleNewInvoice} variant="outline" size="sm" className="bg-white hover:bg-primary-50 text-primary-600 border-primary-200 hover:border-primary-300 shadow-sm hidden md:flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Nouveau
                  </Button>
                  <Button onClick={handleSave} isLoading={isSaving} size="sm" className="bg-primary-600 hover:bg-primary-700 text-white shadow-sm"><span className="hidden sm:inline">Enregistrer</span><span className="sm:hidden">Sauvegarder</span></Button>
                  <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block"></div>
                  <Button variant="outline" size="sm" onClick={handleDownloadPDF} isLoading={isExporting} className="hidden md:flex items-center gap-2" disabled={isSaving || isDeletingInvoice}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>PDF</Button>
                  <Button variant="outline" size="sm" onClick={handlePrint} className="hidden md:flex" disabled={isSaving || isDeletingInvoice}>Imprimer</Button>
                  {currentInvoice && <button onClick={(e) => promptDelete(currentInvoice.id, e)} className="md:hidden p-2 text-red-500 hover:bg-red-50 rounded" disabled={isSaving || isDeletingInvoice}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>}
                </>
              )}
            </div>
          </header>
        )}
        {showSettings ? <Settings profile={profile} onUpdate={onProfileUpdate} onClose={handleCloseSettings} onShowToast={(message, type) => setToast({ message, type })} activeSection={settingsSection || 'general'} onSectionChange={handleSectionChange} /> : (
          <>
            <div className="flex-1 overflow-hidden flex relative pb-16 md:pb-0">
              {currentInvoice ? (
                <>
                  <div className={`w-full md:w-[45%] h-full overflow-y-auto bg-white md:border-r border-slate-200 ${activeTab === 'editor' ? 'block' : 'hidden md:block'}`}><InvoiceEditor invoice={currentInvoice} onChange={setCurrentInvoice} folders={folders} /></div>
                  <div className={`w-full md:w-[55%] h-full bg-slate-100 overflow-y-auto flex flex-col items-center p-0 md:p-8 ${activeTab === 'preview' ? 'block' : 'hidden md:flex'}`}>
                    <div className="md:hidden flex justify-between items-center w-full px-4 py-2 bg-white sticky top-0 z-20 border-b border-slate-200 shadow-sm">
                      <Button variant="outline" size="sm" className="flex-1 mr-2" onClick={handleDownloadPDF} isLoading={isExporting}>Télécharger PDF</Button>
                      <Button variant="outline" size="sm" className="flex-1 ml-2" onClick={handlePrint}>Imprimer</Button>
                    </div>
                    <div className="w-full max-w-none md:max-w-[210mm] mx-auto transition-all duration-300 h-full md:h-auto"><InvoicePreview invoice={currentInvoice} userProfile={profile} isExporting={isExporting} /></div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                  <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4"><svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
                  <h3 className="text-lg font-medium text-slate-700 mb-2">Aucune facture sélectionnée</h3>
                  <p className="max-w-xs mx-auto mb-6 text-sm">Sélectionnez une facture dans l'historique ou créez-en une nouvelle pour commencer.</p>
                  <Button onClick={handleNewInvoice}>Créer une facture</Button>
                </div>
              )}
            </div>

            {/* Mobile Bottom Navigation Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <button
                onClick={() => setActiveTab('editor')}
                className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'editor' ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                <span className="text-[10px] font-medium">Éditeur</span>
              </button>

              {/* Floating Action Button (FAB) in center */}
              <div className="relative -top-5">
                <button
                  onClick={handleNewInvoice}
                  className="w-14 h-14 bg-primary-600 rounded-full text-white shadow-lg shadow-primary-500/40 flex items-center justify-center transform active:scale-95 transition-all border-4 border-slate-50"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>

              <button
                onClick={() => setActiveTab('preview')}
                className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'preview' ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                <span className="text-[10px] font-medium">Aperçu</span>
              </button>
            </div>
          </>
        )}
      </main>
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={onProfileUpdate}
        initialData={profile}
      />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
