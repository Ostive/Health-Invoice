'use client'

import React, { createContext, useCallback, useContext, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { InvoiceStatus, type Invoice } from '@/types';
import { InvoiceService } from '@/services/invoiceService';
import { PLAN_LIMITS, PLAN_LIMITS_ENFORCED } from '@/services/stripeService';
import { generateUUID } from '@/lib/uuid';
import { errorMessage } from '@/lib/errors';
import { useDashboard } from './DashboardContext';

type Tab = 'editor' | 'preview';

interface InvoiceEditorContextType {
    /** Invoice id in the URL (/dashboard/factures/[id]); null on /dashboard, where a new invoice is written */
    openInvoiceId: string | null;
    currentInvoice: Invoice | null;
    setCurrentInvoice: (invoice: Invoice) => void;
    isPersisted: boolean;
    hasUnsavedChanges: boolean;
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
    isSaving: boolean;
    isExporting: boolean;
    setIsExporting: (isExporting: boolean) => void;
    isDeletingInvoice: boolean;
    /** Any save, export or deletion is running */
    isBusy: boolean;
    handleNewInvoice: () => void;
    handleSaveInvoice: () => Promise<boolean>;
    closeInvoice: () => void;
    invoiceToDelete: string | null;
    setInvoiceToDelete: (id: string | null) => void;
    promptDeleteInvoice: (id: string, e?: React.MouseEvent) => void;
    handleDeleteInvoice: () => Promise<void>;
}

const InvoiceEditorContext = createContext<InvoiceEditorContextType | undefined>(undefined);

const isoDate = (date: Date) => date.toISOString().split('T')[0];

function createEmptyInvoice(folderId: string | null): Invoice {
    return {
        id: generateUUID(),
        number: '',
        date: isoDate(new Date()),
        dueDate: isoDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        client: { name: '', address: '', email: '', ssn: '' },
        items: [{ id: generateUUID(), description: 'Consultation', quantity: 1, unitPrice: 25.00 }],
        status: InvoiceStatus.DRAFT,
        template: 'modern',
        notes: '',
        folderId,
    };
}

/**
 * The invoice being edited. Which one is open comes from the URL, so an invoice can be linked,
 * reloaded and reached with back/forward; the provider only keeps the unsaved working copies.
 */
export function InvoiceEditorProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams<{ id?: string }>();
    const { invoices, setInvoices, profile, selectedFolderId, setShowUpgradeModal, setToast, isMutating, refreshInvoices } = useDashboard();

    const openInvoiceId = pathname.startsWith('/dashboard/factures/') ? params.id ?? null : null;
    const isNewInvoicePage = pathname === '/dashboard';

    // Working copies: the new invoice not saved yet, and the edits made to the open saved invoice
    const [draft, setDraft] = useState<Invoice | null>(null);
    const [edited, setEdited] = useState<Invoice | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('editor');
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isDeletingInvoice, setIsDeletingInvoice] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);

    // A new invoice keeps its draft slot until its own URL is shown, then the slot is freed
    // (state adjusted during render: no effect, no flash of the empty screen)
    if (draft && openInvoiceId === draft.id) setDraft(null);

    const saved = openInvoiceId ? invoices.find(i => i.id === openInvoiceId) ?? null : null;
    const currentInvoice = openInvoiceId
        ? (saved && edited?.id === openInvoiceId ? edited : saved)
        : isNewInvoicePage ? draft : null;

    const savedVersion = currentInvoice ? invoices.find(i => i.id === currentInvoice.id) : undefined;
    const isPersisted = !!savedVersion;
    const hasUnsavedChanges = !!currentInvoice && (!savedVersion || JSON.stringify(currentInvoice) !== JSON.stringify(savedVersion));
    const isBusy = isSaving || isExporting || isDeletingInvoice || isMutating;

    const setCurrentInvoice = useCallback((invoice: Invoice) => {
        if (openInvoiceId) setEdited(invoice);
        else setDraft(invoice);
    }, [openInvoiceId]);

    const handleNewInvoice = () => {
        if (isBusy) return;
        if (PLAN_LIMITS_ENFORCED && !profile.is_pro && invoices.length >= PLAN_LIMITS.free.maxInvoices) {
            setShowUpgradeModal(true);
            return;
        }
        setDraft(createEmptyInvoice(selectedFolderId));
        setActiveTab('editor');
        if (!isNewInvoicePage) router.push('/dashboard');
    };

    const handleSaveInvoice = async (): Promise<boolean> => {
        if (!currentInvoice) return false;

        // Due immediately when no due date is set
        const invoiceToSave = currentInvoice.dueDate ? currentInvoice : { ...currentInvoice, dueDate: currentInvoice.date };

        setIsSaving(true);
        try {
            const savedInvoice = await InvoiceService.save(invoiceToSave);
            setInvoices(prev => prev.some(i => i.id === savedInvoice.id)
                ? prev.map(i => i.id === savedInvoice.id ? savedInvoice : i)
                : [savedInvoice, ...prev]);
            setEdited(savedInvoice);
            if (!openInvoiceId) {
                // A new invoice gets its own URL once it exists on the server
                setDraft(savedInvoice);
                router.replace(`/dashboard/factures/${savedInvoice.id}`);
            }
            setToast({ message: `Facture sauvegardée : ${savedInvoice.number}`, type: 'success' });
            return true;
        } catch (error) {
            setToast({ message: `Erreur de sauvegarde : ${errorMessage(error)}`, type: 'error' });
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const closeInvoice = () => {
        if (openInvoiceId) {
            setEdited(null);
            router.push('/dashboard');
        } else {
            setDraft(null);
        }
    };

    const promptDeleteInvoice = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!isBusy) setInvoiceToDelete(id);
    };

    const handleDeleteInvoice = async () => {
        const id = invoiceToDelete;
        if (!id) return;
        // A new invoice only exists in the browser: nothing to delete on the server
        const isSavedInvoice = invoices.some(i => i.id === id);

        setIsDeletingInvoice(true);
        try {
            if (isSavedInvoice) await InvoiceService.delete(id);
            setInvoices(prev => prev.filter(i => i.id !== id));
            if (draft?.id === id) setDraft(null);
            if (edited?.id === id) setEdited(null);
            if (openInvoiceId === id) router.replace('/dashboard');
            setInvoiceToDelete(null);
            if (isSavedInvoice) setToast({ message: 'Facture supprimée', type: 'success' });
        } catch (err) {
            setToast({ message: `La facture n’a pas pu être supprimée : ${errorMessage(err)}`, type: 'error' });
            refreshInvoices();
        } finally {
            setIsDeletingInvoice(false);
        }
    };

    return (
        <InvoiceEditorContext.Provider value={{
            openInvoiceId, currentInvoice, setCurrentInvoice, isPersisted, hasUnsavedChanges,
            activeTab, setActiveTab, isSaving, isExporting, setIsExporting, isDeletingInvoice, isBusy,
            handleNewInvoice, handleSaveInvoice, closeInvoice,
            invoiceToDelete, setInvoiceToDelete, promptDeleteInvoice, handleDeleteInvoice,
        }}>
            {children}
        </InvoiceEditorContext.Provider>
    );
}

export function useInvoiceEditor() {
    const context = useContext(InvoiceEditorContext);
    if (context === undefined) {
        throw new Error('useInvoiceEditor must be used within an InvoiceEditorProvider');
    }
    return context;
}
