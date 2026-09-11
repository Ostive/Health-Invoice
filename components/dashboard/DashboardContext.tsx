'use client'

import React, { createContext, use, useCallback, useContext, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { DashboardData, Folder, Invoice, SessionUser, UserProfile } from '@/types';
import type { PatientInput } from '@/lib/schemas';
import type { ToastType } from '@/components/ui/toast';
import { InvoiceService } from '@/services/invoiceService';
import { PatientService } from '@/services/patientService';
import { ProfileService } from '@/services/profileService';
import { subscribeToPro } from '@/services/stripeService';
import { errorMessage } from '@/lib/errors';

type Toast = { message: string; type: ToastType } | null;
type DateRange = { start: string; end: string };

/** The dashboard's data (read on the server by the layout) and everything around it; editing lives in InvoiceEditorContext */
interface DashboardContextType {
    user: SessionUser;
    profile: UserProfile;
    invoices: Invoice[];
    setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
    folders: Folder[];
    patients: PatientInput[];
    isLoadingList: boolean;
    fetchError: string | null;
    refreshInvoices: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    refreshPatients: () => Promise<void>;

    // Sidebar filters
    selectedFolderId: string | null;
    setSelectedFolderId: (id: string | null) => void;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    folderSearchQuery: string;
    setFolderSearchQuery: (q: string) => void;
    showDateFilter: boolean;
    setShowDateFilter: (show: boolean) => void;
    dateRange: DateRange;
    setDateRange: (range: DateRange) => void;
    displayedInvoices: Invoice[];

    // Multi-selection and bulk deletion
    selectedInvoiceIds: Set<string>;
    selectedFolderIds: Set<string>;
    toggleInvoiceSelection: (id: string) => void;
    toggleFolderSelection: (id: string) => void;
    toggleSelectAllInvoices: () => void;
    showBulkDeleteModal: boolean;
    setShowBulkDeleteModal: (show: boolean) => void;
    bulkDeleteType: 'invoices' | 'folders';
    handleBulkDeleteInvoices: () => void;
    handleBulkDeleteFolders: () => void;
    confirmBulkDelete: () => Promise<void>;
    isBulkDeleting: boolean;

    // Folders
    showCreateFolderModal: boolean;
    setShowCreateFolderModal: (show: boolean) => void;
    folderToEdit: Folder | null;
    setFolderToEdit: (folder: Folder | null) => void;
    handleCreateFolderClick: () => void;
    handleEditFolder: (folder: Folder, e: React.MouseEvent) => void;
    confirmFolderAction: (name: string, color: string) => Promise<void>;
    isSavingFolder: boolean;
    folderToDelete: Folder | null;
    setFolderToDelete: (folder: Folder | null) => void;
    handleDeleteFolderClick: (folder: Folder, e: React.MouseEvent) => void;
    confirmDeleteFolder: () => Promise<void>;
    isDeletingFolder: boolean;

    // Account
    showUpgradeModal: boolean;
    setShowUpgradeModal: (show: boolean) => void;
    handleStartUpgrade: () => void;
    showOnboarding: boolean;
    setShowOnboarding: (show: boolean) => void;
    onLogout: () => Promise<void>;

    toast: Toast;
    setToast: (toast: Toast) => void;

    /** A folder or bulk operation is running */
    isMutating: boolean;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children, user, data }: {
    children: React.ReactNode;
    user: SessionUser;
    data: Promise<DashboardData>;
}) {
    // Started by the server layout; suspends (skeleton shown) until the data has streamed in
    const initial = use(data);
    const router = useRouter();
    const params = useParams<{ id?: string }>();

    const [profile, setProfile] = useState(initial.profile);
    const [invoices, setInvoices] = useState(initial.invoices);
    const [folders, setFolders] = useState(initial.folders);
    const [patients, setPatients] = useState(initial.patients);
    const [fetchError, setFetchError] = useState(initial.invoicesError);
    const [isLoadingList, setIsLoadingList] = useState(false);

    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [folderSearchQuery, setFolderSearchQuery] = useState('');
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange>({ start: '', end: '' });

    const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<Set<string>>(new Set());
    const [selectedFolderIds, setSelectedFolderIds] = useState<Set<string>>(new Set());
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [bulkDeleteType, setBulkDeleteType] = useState<'invoices' | 'folders'>('invoices');
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
    const [folderToEdit, setFolderToEdit] = useState<Folder | null>(null);
    const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
    const [isSavingFolder, setIsSavingFolder] = useState(false);
    const [isDeletingFolder, setIsDeletingFolder] = useState(false);

    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(!initial.profile.full_name);
    const [toast, setToast] = useState<Toast>(null);

    // Refetches through the Route Handlers, after a failed mutation or a change made elsewhere
    const refreshInvoices = useCallback(async () => {
        setIsLoadingList(true);
        setFetchError(null);
        try {
            setInvoices(await InvoiceService.fetchAll());
        } catch (err) {
            setFetchError(`Vos factures n’ont pas pu être chargées : ${errorMessage(err)}`);
        } finally {
            setIsLoadingList(false);
        }
    }, []);

    const refreshFolders = useCallback(async () => {
        try {
            setFolders(await InvoiceService.fetchFolders());
        } catch (err) {
            console.warn('Error fetching folders:', err);
        }
    }, []);

    const refreshPatients = useCallback(async () => {
        try {
            setPatients(await PatientService.fetchAll());
        } catch (err) {
            console.warn('Error fetching patients:', err);
        }
    }, []);

    const refreshProfile = useCallback(async () => {
        try {
            setProfile(await ProfileService.fetch());
        } catch (err) {
            console.warn('Error fetching profile:', err);
        }
    }, []);

    const displayedInvoices = useMemo(() => invoices.filter(i => {
        if (selectedFolderId && i.folderId !== selectedFolderId) return false;
        if (dateRange.start && i.date < dateRange.start) return false;
        if (dateRange.end && i.date > dateRange.end) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return i.client.name.toLowerCase().includes(q) || i.number.toLowerCase().includes(q);
        }
        return true;
    }), [invoices, selectedFolderId, dateRange, searchQuery]);

    const toggleIn = (set: Set<string>, id: string) => {
        const next = new Set(set);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
    };
    const toggleInvoiceSelection = (id: string) => setSelectedInvoiceIds(prev => toggleIn(prev, id));
    const toggleFolderSelection = (id: string) => setSelectedFolderIds(prev => toggleIn(prev, id));
    const toggleSelectAllInvoices = () => {
        setSelectedInvoiceIds(selectedInvoiceIds.size === displayedInvoices.length ? new Set() : new Set(displayedInvoices.map(i => i.id)));
    };

    const handleBulkDeleteInvoices = () => {
        if (selectedInvoiceIds.size === 0) return;
        setBulkDeleteType('invoices');
        setShowBulkDeleteModal(true);
    };

    const handleBulkDeleteFolders = () => {
        if (selectedFolderIds.size === 0) return;
        setBulkDeleteType('folders');
        setShowBulkDeleteModal(true);
    };

    const confirmBulkDelete = async () => {
        setIsBulkDeleting(true);
        try {
            if (bulkDeleteType === 'invoices') {
                const ids = selectedInvoiceIds;
                await InvoiceService.deleteMultiple([...ids]);
                setInvoices(prev => prev.filter(i => !ids.has(i.id)));
                // The open invoice was among them: its URL no longer points to anything
                if (params.id && ids.has(params.id)) router.replace('/dashboard');
                setSelectedInvoiceIds(new Set());
                setToast({ message: `${ids.size} factures supprimées`, type: 'success' });
            } else {
                const ids = selectedFolderIds;
                await InvoiceService.deleteMultipleFolders([...ids]);
                setFolders(prev => prev.filter(f => !ids.has(f.id)));
                if (selectedFolderId && ids.has(selectedFolderId)) setSelectedFolderId(null);
                setSelectedFolderIds(new Set());
                setToast({ message: `${ids.size} dossiers supprimés`, type: 'success' });
            }
        } catch (err) {
            setToast({ message: `Erreur : ${errorMessage(err)}`, type: 'error' });
            if (bulkDeleteType === 'invoices') refreshInvoices();
            else refreshFolders();
        } finally {
            setIsBulkDeleting(false);
            setShowBulkDeleteModal(false);
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

    const confirmFolderAction = async (name: string, color: string) => {
        setIsSavingFolder(true);
        try {
            if (folderToEdit) {
                const updated = await InvoiceService.updateFolder(folderToEdit.id, name, color);
                setFolders(prev => prev.map(f => f.id === updated.id ? updated : f));
                setToast({ message: 'Dossier modifié', type: 'success' });
            } else {
                const created = await InvoiceService.createFolder(name, color);
                setFolders(prev => [...prev, created]);
                setToast({ message: 'Dossier créé', type: 'success' });
            }
            setShowCreateFolderModal(false);
            setFolderToEdit(null);
        } catch (err) {
            setToast({ message: `Erreur : ${errorMessage(err)}`, type: 'error' });
        } finally {
            setIsSavingFolder(false);
        }
    };

    const handleDeleteFolderClick = (folder: Folder, e: React.MouseEvent) => {
        e.stopPropagation();
        setFolderToDelete(folder);
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
        } catch (err) {
            setToast({ message: `Erreur : ${errorMessage(err)}`, type: 'error' });
        } finally {
            setIsDeletingFolder(false);
        }
    };

    const handleStartUpgrade = () => {
        setShowUpgradeModal(false);
        subscribeToPro(user.id, user.email);
    };

    const onLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (err) {
            console.error('Logout failed:', err);
        }
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-') && key.includes('-auth-token')) localStorage.removeItem(key);
        });
        sessionStorage.clear();
        // Full page load on purpose: nothing of the patients' data stays in memory
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = '/';
    };

    return (
        <DashboardContext.Provider value={{
            user, profile, invoices, setInvoices, folders, patients, isLoadingList, fetchError,
            refreshInvoices, refreshProfile, refreshPatients,
            selectedFolderId, setSelectedFolderId, searchQuery, setSearchQuery, folderSearchQuery, setFolderSearchQuery,
            showDateFilter, setShowDateFilter, dateRange, setDateRange, displayedInvoices,
            selectedInvoiceIds, selectedFolderIds, toggleInvoiceSelection, toggleFolderSelection, toggleSelectAllInvoices,
            showBulkDeleteModal, setShowBulkDeleteModal, bulkDeleteType, handleBulkDeleteInvoices, handleBulkDeleteFolders,
            confirmBulkDelete, isBulkDeleting,
            showCreateFolderModal, setShowCreateFolderModal, folderToEdit, setFolderToEdit, handleCreateFolderClick,
            handleEditFolder, confirmFolderAction, isSavingFolder,
            folderToDelete, setFolderToDelete, handleDeleteFolderClick, confirmDeleteFolder, isDeletingFolder,
            showUpgradeModal, setShowUpgradeModal, handleStartUpgrade, showOnboarding, setShowOnboarding, onLogout,
            toast, setToast,
            isMutating: isSavingFolder || isDeletingFolder || isBulkDeleting,
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
