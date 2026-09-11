'use client'

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { Invoice, InvoiceStatus, UserProfile, Folder } from '../../types/index';
import { InvoiceService } from '../../services/invoiceService';
import { PatientService } from '../../services/patientService';
import { subscribeToPro, PLAN_LIMITS } from '../../services/stripeService';
import { ToastType } from '../ui/toast';
import { PatientInput } from '../../lib/schemas';

import { generateUUID } from '../../lib/uuid';

interface DashboardContextType {
    user: User | null;
    profile: UserProfile | null;
    invoices: Invoice[];
    folders: Folder[];
    patients: PatientInput[];
    currentInvoice: Invoice | null;
    setCurrentInvoice: (invoice: Invoice | null) => void;

    // UI State
    isLoadingList: boolean;
    isBusy: boolean;
    isSaving: boolean;
    isExporting: boolean;
    setIsExporting: (isExporting: boolean) => void;
    isDeletingInvoice: boolean;
    isDeletingFolder: boolean;
    isSavingFolder: boolean;
    fetchError: string | null;

    // Selection & Filters
    selectedInvoiceIds: Set<string>;
    selectedFolderIds: Set<string>;
    selectedFolderId: string | null;
    setSelectedFolderId: (id: string | null) => void;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    folderSearchQuery: string;
    setFolderSearchQuery: (q: string) => void;
    showDateFilter: boolean;
    setShowDateFilter: (show: boolean) => void;
    dateRange: { start: string; end: string };
    setDateRange: (range: { start: string; end: string }) => void;
    displayedInvoices: Invoice[];
    activeTab: 'editor' | 'preview';
    setActiveTab: (tab: 'editor' | 'preview') => void;

    // Modals
    showUpgradeModal: boolean;
    setShowUpgradeModal: (show: boolean) => void;
    invoiceToDelete: string | null;
    setInvoiceToDelete: (id: string | null) => void;
    folderToDelete: Folder | null;
    setFolderToDelete: (folder: Folder | null) => void;
    showCreateFolderModal: boolean;
    setShowCreateFolderModal: (show: boolean) => void;
    folderToEdit: Folder | null;
    setFolderToEdit: (folder: Folder | null) => void;
    showOnboarding: boolean;
    setShowOnboarding: (show: boolean) => void;

    // Bulk Delete Modal Props
    showBulkDeleteModal: boolean;
    setShowBulkDeleteModal: (show: boolean) => void;
    bulkDeleteType: 'invoices' | 'folders';
    confirmBulkDelete: () => Promise<void>;

    // Actions
    refreshProfile: () => Promise<void>;
    refreshPatients: () => Promise<void>;
    handleNewInvoice: () => void;
    handleInvoiceSelect: (inv: Invoice) => void;
    handleSaveInvoice: () => Promise<boolean>;
    handleDeleteInvoice: () => Promise<void>;
    handleBulkDeleteInvoices: () => Promise<void>;
    handleBulkDeleteFolders: () => Promise<void>;
    handleCreateFolderClick: () => void;
    handleEditFolder: (folder: Folder, e: React.MouseEvent) => void;
    handleDeleteFolderClick: (folder: Folder, e: React.MouseEvent) => void;
    confirmFolderAction: (name: string, color: string) => Promise<void>;
    confirmDeleteFolder: () => Promise<void>;
    promptDeleteInvoice: (id: string, e: React.MouseEvent) => void;
    toggleInvoiceSelection: (id: string) => void;
    toggleFolderSelection: (id: string) => void;
    toggleSelectAllInvoices: () => void;
    handleStartUpgrade: () => void;
    onLogout: () => Promise<void>;

    // Toast
    toast: { message: string; type: ToastType } | null;
    setToast: (toast: { message: string; type: ToastType } | null) => void;

    // State
    hasUnsavedChanges: boolean;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({
    children,
    initialUser
}: {
    children: React.ReactNode;
    initialUser: User
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User>(initialUser);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    // Data State
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [patients, setPatients] = useState<PatientInput[]>([]);
    const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);

    // UI State
    const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
    const [isLoadingList, setIsLoadingList] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isDeletingInvoice, setIsDeletingInvoice] = useState(false);
    const [isSavingFolder, setIsSavingFolder] = useState(false);
    const [isDeletingFolder, setIsDeletingFolder] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Filters & Selection
    const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<Set<string>>(new Set());
    const [selectedFolderIds, setSelectedFolderIds] = useState<Set<string>>(new Set());
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [folderSearchQuery, setFolderSearchQuery] = useState('');
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

    // Computed: Check for unsaved changes
    const hasUnsavedChanges = React.useMemo(() => {
        if (!currentInvoice) return false;
        const saved = invoices.find(i => i.id === currentInvoice.id);
        if (!saved) return true; // New invoice not in list
        return JSON.stringify(currentInvoice) !== JSON.stringify(saved);
    }, [currentInvoice, invoices]);

    // Modals
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
    const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
    const [folderToEdit, setFolderToEdit] = useState<Folder | null>(null);
    const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(false);

    // Bulk Delete Modal State
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [bulkDeleteType, setBulkDeleteType] = useState<'invoices' | 'folders'>('invoices');

    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    // Fetch Profile
    const fetchProfile = useCallback(async () => {
        try {
            const response = await fetch('/api/profile');
            const data = await response.json();

            const defaults = {
                full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
                email: user.email || ''
            };

            if (!data || data.error) {
                setProfile({
                    id: user.id,
                    email: defaults.email,
                    full_name: defaults.full_name,
                    is_pro: false
                });
                return;
            }

            if (data) {
                setProfile({
                    ...data,
                    full_name: data.full_name || defaults.full_name,
                    email: data.email || defaults.email
                } as UserProfile);
            }
        } catch (err) {
            console.warn("Error fetching profile:", err);
        }
    }, [user]);

    // Fetch Invoices & Folders
    const fetchInvoices = useCallback(async () => {
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
    }, [user]);

    const fetchFolders = useCallback(async () => {
        if (!user?.id) return;
        try {
            const data = await InvoiceService.fetchFolders(user.id);
            setFolders(data);
        } catch (err) {
            console.warn("Error fetching folders:", err);
        }
    }, [user]);

    const fetchPatients = useCallback(async () => {
        if (!user?.id) return;
        try {
            const data = await PatientService.fetchAll();
            setPatients(data);
        } catch (err) {
            console.warn("Error fetching patients:", err);
        }
    }, [user]);

    useEffect(() => {
        if (user?.id) {
            fetchProfile();
            fetchInvoices();
            fetchFolders();
            fetchPatients();
        }
    }, [user, fetchProfile, fetchInvoices, fetchFolders, fetchPatients]);

    useEffect(() => {
        if (profile && !profile.full_name) {
            setShowOnboarding(true);
        }
    }, [profile]);

    // Computed
    const displayedInvoices = invoices.filter(i => {
        if (selectedFolderId && i.folderId !== selectedFolderId) return false;
        if (dateRange.start && i.date < dateRange.start) return false;
        if (dateRange.end && i.date > dateRange.end) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const matchName = i.client.name.toLowerCase().includes(q);
            const matchNumber = i.number.toLowerCase().includes(q);
            return matchName || matchNumber;
        }
        return true;
    });
    const isBusy = isSaving || isDeletingInvoice || isExporting || isSavingFolder || isDeletingFolder;

    // Actions
    const createEmptyInvoice = (): Invoice => {
        return {
            id: generateUUID(),
            number: '',
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

    // The invoice editor lives on /dashboard: opening an invoice from another section navigates there
    const openInvoicesPage = () => {
        if (pathname !== '/dashboard') router.push('/dashboard');
    };

    const handleNewInvoice = () => {
        // Wait for the invoice list: the free-plan quota below is computed from it
        if (isBusy || isLoadingList) return;
        if (!profile?.is_pro && invoices.length >= PLAN_LIMITS.free.maxInvoices) {
            setShowUpgradeModal(true);
            return;
        }
        const newInv = createEmptyInvoice();
        setCurrentInvoice(newInv);
        setActiveTab('editor');
        openInvoicesPage();
    };

    const handleInvoiceSelect = (inv: Invoice) => {
        if (isBusy) return;
        setCurrentInvoice(inv);
        localStorage.setItem('lastOpenedInvoiceId', inv.id);
        setActiveTab('editor');
        openInvoicesPage();
    };

    const handleSaveInvoice = async (): Promise<boolean> => {
        if (!currentInvoice || !user?.id) return false;

        // Auto-fix missing due date to prevent validation error
        const invoiceToSave = { ...currentInvoice };
        if (!invoiceToSave.dueDate) {
            // Default to invoice date (due immediately) if not set
            invoiceToSave.dueDate = invoiceToSave.date;
        }

        setIsSaving(true);
        try {
            const savedInvoice = await InvoiceService.save(invoiceToSave, user.id);
            setInvoices(prev => {
                const exists = prev.find(i => i.id === savedInvoice.id);
                return exists
                    ? prev.map(i => i.id === savedInvoice.id ? savedInvoice : i)
                    : [savedInvoice, ...prev];
            });
            setCurrentInvoice(savedInvoice);
            setToast({ message: `Facture sauvegardée: ${savedInvoice.number}`, type: 'success' });
            return true;
        } catch (error: any) {
            let message = error.message;

            // User-friendly Error Mapping
            if (message.includes('Client name is required') || message.includes('Le nom du client est requis')) {
                message = 'Le nom du client est obligatoire.';
            } else if (message.includes('Invoice date is required')) {
                message = 'La date de la facture est obligatoire.';
            } else if (message.includes('At least one item is required') || message.includes('Au moins une prestation est requise')) {
                message = 'Au moins une prestation est requise.';
            } else if (message.includes('Validation failed')) {
                // Strip the prefix
                const validMsg = message.replace('Validation failed:', '').trim();

                // Handle generic Zod "Required" errors (often "Invalid input: expected string, received undefined")
                if (validMsg.includes('expected string, received undefined')) {
                    // Try to be more specific based on common missing fields if we can, otherwise generic
                    message = "Erreur de validation : Un champ obligatoire (text) est manquant (ex: Nom du client, Date, Description).";
                } else {
                    message = `Erreur de validation : ${validMsg}`;
                }
            }

            setToast({ message: `Erreur de sauvegarde: ${message}`, type: 'error' });
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteInvoice = async () => {
        if (!invoiceToDelete) return;
        setIsDeletingInvoice(true);
        try {
            await InvoiceService.delete(invoiceToDelete);
            const remaining = invoices.filter(i => i.id !== invoiceToDelete);
            setInvoices(remaining);
            if (currentInvoice?.id === invoiceToDelete) {
                setCurrentInvoice(remaining.length > 0 ? remaining[0] : createEmptyInvoice());
            }
            setInvoiceToDelete(null);
        } catch (err: any) {
            setToast({ message: `Erreur: ${err.message}`, type: 'error' });
            fetchInvoices();
        } finally {
            setIsDeletingInvoice(false);
        }
    };

    const handleBulkDeleteInvoices = async () => {
        if (selectedInvoiceIds.size === 0) return;
        setBulkDeleteType('invoices');
        setShowBulkDeleteModal(true);
    };

    const handleBulkDeleteFolders = async () => {
        if (selectedFolderIds.size === 0) return;
        setBulkDeleteType('folders');
        setShowBulkDeleteModal(true);
    };

    const confirmBulkDelete = async () => {
        if (bulkDeleteType === 'invoices') {
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
                fetchInvoices();
            } finally {
                setIsDeletingInvoice(false);
                setShowBulkDeleteModal(false);
            }
        } else {
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
                setShowBulkDeleteModal(false);
            }
        }
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

    const toggleInvoiceSelection = (id: string) => {
        const newSelection = new Set(selectedInvoiceIds);
        if (newSelection.has(id)) newSelection.delete(id);
        else newSelection.add(id);
        setSelectedInvoiceIds(newSelection);
    };

    const toggleFolderSelection = (id: string) => {
        const newSelection = new Set(selectedFolderIds);
        if (newSelection.has(id)) newSelection.delete(id);
        else newSelection.add(id);
        setSelectedFolderIds(newSelection);
    };

    const toggleSelectAllInvoices = () => {
        if (selectedInvoiceIds.size === displayedInvoices.length) {
            setSelectedInvoiceIds(new Set());
        } else {
            setSelectedInvoiceIds(new Set(displayedInvoices.map(i => i.id)));
        }
    };

    const promptDeleteInvoice = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (isBusy) return;
        setInvoiceToDelete(id);
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

    const handleDeleteFolderClick = (folder: Folder, e: React.MouseEvent) => {
        e.stopPropagation();
        setFolderToDelete(folder);
    };

    const handleStartUpgrade = () => {
        setShowUpgradeModal(false);
        if (user) subscribeToPro(user.id, user.email);
    };

    const onLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('sb-') && key.includes('-auth-token')) {
                    localStorage.removeItem(key);
                }
            });
            sessionStorage.clear();
            window.location.href = '/';
        } catch (err) {
            console.error("Logout failed:", err);
            window.location.href = '/';
        }
    };

    return (
        <DashboardContext.Provider value={{
            user, profile, invoices, folders, patients, currentInvoice, setCurrentInvoice,
            isLoadingList, isBusy, isSaving, isExporting, setIsExporting, isDeletingInvoice, isDeletingFolder, isSavingFolder, fetchError,
            selectedInvoiceIds, selectedFolderIds, selectedFolderId, setSelectedFolderId,
            searchQuery, setSearchQuery, folderSearchQuery, setFolderSearchQuery,
            showDateFilter, setShowDateFilter, dateRange, setDateRange, displayedInvoices,
            activeTab, setActiveTab,
            showUpgradeModal, setShowUpgradeModal, invoiceToDelete, setInvoiceToDelete,
            folderToDelete, setFolderToDelete, showCreateFolderModal, setShowCreateFolderModal,
            folderToEdit, setFolderToEdit, showOnboarding, setShowOnboarding,
            // Bulk Delete Props
            showBulkDeleteModal, setShowBulkDeleteModal, bulkDeleteType, confirmBulkDelete,
            refreshProfile: fetchProfile, refreshPatients: fetchPatients,
            handleNewInvoice, handleInvoiceSelect, handleSaveInvoice, handleDeleteInvoice,
            handleBulkDeleteInvoices, handleBulkDeleteFolders, handleCreateFolderClick,
            handleEditFolder, handleDeleteFolderClick, confirmFolderAction, confirmDeleteFolder,
            promptDeleteInvoice, toggleInvoiceSelection, toggleFolderSelection, toggleSelectAllInvoices,
            handleStartUpgrade, onLogout, toast, setToast,
            hasUnsavedChanges
        }}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
}
