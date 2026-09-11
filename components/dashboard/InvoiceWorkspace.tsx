'use client'

import React from 'react';
import { useDashboard } from './DashboardContext';
import { InvoiceEditor } from '../InvoiceEditor';
import { InvoicePreview } from '../InvoicePreview';
import { Button, Spinner } from '../ui/button';
import { Modal } from '../ui/modal';
import { Icon, IconName } from '../ui/icon';
import { StatusStamp } from '../ui/stamp';
import { cn } from '@/lib/cn';
import { errorMessage } from '@/lib/errors';

const MobileAction = ({ icon, label, onClick, disabled, busy, tone = 'default' }: {
    icon: IconName; label: string; onClick: (e: React.MouseEvent) => void; disabled?: boolean; busy?: boolean; tone?: 'default' | 'primary' | 'danger';
}) => (
    <button
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={cn(
            'grid size-10 place-items-center rounded-lg transition-colors disabled:text-rule-strong',
            tone === 'primary' && 'text-primary-600 hover:bg-primary-50',
            tone === 'danger' && 'text-red-600 hover:bg-red-50',
            tone === 'default' && 'text-ink-soft hover:bg-paper',
        )}
    >
        {busy ? <Spinner className="size-5" /> : <Icon name={icon} className="size-5" />}
    </button>
);

export const InvoiceWorkspace = () => {
    const {
        currentInvoice, setCurrentInvoice,
        profile,
        activeTab, setActiveTab,
        isBusy, isSaving, isExporting, setIsExporting,
        handleNewInvoice, handleSaveInvoice, promptDeleteInvoice,
        setToast, folders, invoiceToDelete, patients, hasUnsavedChanges, invoices
    } = useDashboard();

    const [showUnsavedModal, setShowUnsavedModal] = React.useState(false);
    const [pendingAction, setPendingAction] = React.useState<'print' | 'pdf' | 'close' | null>(null);

    // Navigation Guard for Unsaved Changes
    React.useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    // Check if the current invoice actually exists in the database list
    const isPersisted = React.useMemo(() => {
        return currentInvoice ? invoices.some(i => i.id === currentInvoice.id) : false;
    }, [currentInvoice, invoices]);

    const printInvoice = () => {
        try {
            window.print();
        } catch {
            setToast({ message: "L'impression n'a pas pu démarrer. Téléchargez le PDF puis imprimez-le.", type: 'error' });
        }
    };

    const handleClose = () => {
        if (isBusy) return;
        if (hasUnsavedChanges) {
            setPendingAction('close');
            setShowUnsavedModal(true);
            return;
        }
        setCurrentInvoice(null);
    };

    const executePendingAction = async () => {
        if (pendingAction === 'print') {
            printInvoice();
        } else if (pendingAction === 'pdf') {
            await performPDFDownload();
        } else if (pendingAction === 'close') {
            setCurrentInvoice(null);
        }
        setPendingAction(null);
        setShowUnsavedModal(false);
    };

    const handleSaveAndContinue = async () => {
        try {
            const success = await handleSaveInvoice();
            if (success) {
                setTimeout(async () => {
                    await executePendingAction();
                }, 500);
            }
        } catch (e) {
            console.error("Save failed in modal flow", e);
        }
    };

    const performPDFDownload = async () => {
        if (!currentInvoice) return;

        // Final guard: Must be persisted
        const serverSideCheck = invoices.some(i => i.id === currentInvoice.id);
        if (!serverSideCheck) {
            setToast({ message: 'Enregistrez la facture avant de télécharger le PDF.', type: 'error' });
            setIsExporting(false);
            return;
        }

        if (!currentInvoice.number?.trim() || !currentInvoice.client.name?.trim()) {
            setToast({ message: 'Renseignez le numéro de facture et le nom du patient.', type: 'error' });
            return;
        }

        setIsExporting(true);
        try {
            const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invoiceId: currentInvoice.id }),
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || 'Failed to generate PDF');
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

            setToast({ message: 'PDF téléchargé', type: 'success' });
        } catch (err) {
            setToast({ message: `Le PDF n'a pas pu être généré : ${errorMessage(err)}`, type: 'error' });
        } finally {
            setIsExporting(false);
        }
    };

    const handlePrint = () => {
        if (isBusy) return;

        if (!isPersisted) {
            setToast({ message: 'Enregistrez la facture avant de l’imprimer.', type: 'error' });
            return;
        }

        if (hasUnsavedChanges) {
            setPendingAction('print');
            setShowUnsavedModal(true);
            return;
        }
        printInvoice();
    };

    const handleDownloadPDF = async () => {
        if (!currentInvoice || isBusy) return;

        if (!isPersisted) {
            setToast({ message: 'Enregistrez la facture avant de télécharger le PDF.', type: 'error' });
            return;
        }

        if (hasUnsavedChanges) {
            setPendingAction('pdf');
            setShowUnsavedModal(true);
            return;
        }
        await performPDFDownload();
    };

    const modalConfig = React.useMemo(() => {
        if (pendingAction === 'close') {
            return {
                title: 'Fermer sans enregistrer ?',
                message: 'Vos dernières modifications ne sont pas enregistrées. Si vous fermez maintenant, elles seront perdues.',
                confirmLabel: 'Enregistrer et fermer',
                cancelLabel: 'Fermer sans enregistrer',
            };
        }
        return {
            title: 'Modifications non enregistrées',
            message: "Le document généré n'inclura pas vos dernières modifications tant qu'elles ne sont pas enregistrées.",
            confirmLabel: `Enregistrer et ${pendingAction === 'print' ? 'imprimer' : 'télécharger'}`,
            cancelLabel: 'Annuler',
        };
    }, [pendingAction]);

    const title = currentInvoice ? (currentInvoice.client.name || `Facture ${currentInvoice.number || ''}`.trim()) : 'Factures';

    return (
        <>
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-rule bg-white px-3 md:px-6 print:hidden">
                <div className="flex min-w-0 items-center gap-3">
                    <h1 className="truncate font-display text-base font-semibold text-ink">{title}</h1>
                    {currentInvoice && isPersisted && <StatusStamp status={currentInvoice.status} className="hidden sm:inline-flex" />}
                    {currentInvoice && !isPersisted && (
                        <span className="shrink-0 rounded-full bg-sent-50 px-2 py-0.5 text-xs font-medium text-sent-700">Nouvelle</span>
                    )}
                    {currentInvoice && isPersisted && hasUnsavedChanges && (
                        <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-ink-soft">
                            <span className="size-1.5 rounded-full bg-amber-500" aria-hidden="true" />Non enregistrée
                        </span>
                    )}
                </div>

                {invoiceToDelete ? (
                    <span className="text-sm font-medium text-red-700">Suppression…</span>
                ) : currentInvoice && (
                    <div className="flex items-center gap-1 md:gap-2">
                        <Button variant="ghost" size="sm" onClick={handleClose} className="hidden md:inline-flex" disabled={isBusy}>
                            <Icon name="close" />Fermer
                        </Button>
                        <Button variant="ghost" size="sm" onClick={(e) => promptDeleteInvoice(currentInvoice.id, e)} className="hidden text-red-700 hover:bg-red-50 hover:text-red-800 md:inline-flex" disabled={isBusy}>
                            <Icon name="trash" />Supprimer
                        </Button>
                        <span className="mx-1 hidden h-6 w-px bg-rule md:block" aria-hidden="true" />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadPDF}
                            isLoading={isExporting}
                            className="hidden md:inline-flex"
                            disabled={isBusy || !isPersisted}
                            title={!isPersisted ? 'Enregistrez la facture pour la télécharger' : undefined}
                        >
                            {!isExporting && <Icon name="download" />}PDF
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrint}
                            className="hidden md:inline-flex"
                            disabled={isBusy || !isPersisted}
                            title={!isPersisted ? 'Enregistrez la facture pour l’imprimer' : undefined}
                        >
                            <Icon name="print" />Imprimer
                        </Button>
                        <Button onClick={handleSaveInvoice} isLoading={isSaving} size="sm" className="hidden sm:inline-flex">
                            Enregistrer
                        </Button>

                        <div className="flex items-center sm:hidden">
                            <MobileAction icon="save" label="Enregistrer" onClick={handleSaveInvoice} disabled={isSaving || isBusy} busy={isSaving} tone="primary" />
                        </div>
                        <div className="flex items-center md:hidden">
                            <MobileAction icon="download" label="Télécharger le PDF" onClick={handleDownloadPDF} disabled={isExporting || isBusy || !isPersisted} busy={isExporting} />
                            <MobileAction icon="print" label="Imprimer" onClick={handlePrint} disabled={isBusy || !isPersisted} />
                            <MobileAction icon="trash" label="Supprimer la facture" onClick={(e) => promptDeleteInvoice(currentInvoice.id, e)} disabled={isBusy} tone="danger" />
                        </div>
                    </div>
                )}
            </header>

            <div className="relative flex flex-1 overflow-hidden pb-16 md:pb-0">
                {currentInvoice ? (
                    <>
                        <div className={cn('h-full w-full overflow-y-auto bg-white md:w-[46%] md:border-r md:border-rule print:hidden', activeTab === 'editor' ? 'block' : 'hidden md:block')}>
                            <InvoiceEditor invoice={currentInvoice} onChange={setCurrentInvoice} folders={folders} patients={patients} />
                        </div>
                        <div className={cn('h-full w-full flex-col items-center overflow-y-auto bg-desk p-0 md:w-[54%] md:p-8 print:block print:h-auto print:overflow-visible print:bg-white print:p-0', activeTab === 'preview' ? 'flex' : 'hidden md:flex')}>
                            <div className="mx-auto h-full w-full max-w-none transition-all duration-300 md:h-auto md:max-w-[210mm] print:h-auto print:w-full print:max-w-none">
                                <InvoicePreview invoice={currentInvoice} userProfile={profile} isExporting={isExporting} />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                        <div className="relative mb-7 h-28 w-24 rotate-[-3deg] rounded-md bg-white shadow-sheet ring-1 ring-rule" aria-hidden="true">
                            <div className="space-y-2 p-4">
                                <div className="h-1.5 w-10 rounded-full bg-rule-strong" />
                                <div className="h-1.5 w-14 rounded-full bg-rule" />
                                <div className="h-1.5 w-12 rounded-full bg-rule" />
                            </div>
                            <span className="absolute -bottom-2 -right-3 rotate-[-8deg] rounded-[4px] border border-dashed border-ink-faint bg-white px-1.5 py-[3px] font-display text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
                                Brouillon
                            </span>
                        </div>
                        <h2 className="font-display text-lg font-semibold text-ink">Aucune facture ouverte</h2>
                        <p className="mx-auto mb-6 mt-2 max-w-xs text-sm leading-relaxed text-ink-soft">
                            Ouvrez une facture de l’historique, ou créez-en une nouvelle et dictez vos actes.
                        </p>
                        <Button onClick={handleNewInvoice}>
                            <Icon name="plus" strokeWidth={2.25} />Nouvelle facture
                        </Button>
                    </div>
                )}
            </div>

            <nav aria-label="Vue de la facture" className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-rule bg-white pb-safe md:hidden print:hidden">
                <button
                    onClick={() => setActiveTab('editor')}
                    aria-pressed={activeTab === 'editor'}
                    className={cn('flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium', activeTab === 'editor' ? 'text-primary-600' : 'text-ink-faint')}
                >
                    <Icon name="write" className="size-5" />Éditeur
                </button>
                <div className="relative -top-4 flex items-start px-4">
                    <button
                        onClick={handleNewInvoice}
                        aria-label="Nouvelle facture"
                        className="grid size-14 place-items-center rounded-full border-4 border-paper bg-primary-600 text-white shadow-pop transition-transform active:scale-95"
                    >
                        <Icon name="plus" className="size-6" strokeWidth={2.25} />
                    </button>
                </div>
                <button
                    onClick={() => setActiveTab('preview')}
                    aria-pressed={activeTab === 'preview'}
                    className={cn('flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium', activeTab === 'preview' ? 'text-primary-600' : 'text-ink-faint')}
                >
                    <Icon name="eye" className="size-5" />Aperçu
                </button>
            </nav>

            <Modal
                isOpen={showUnsavedModal}
                onClose={() => setShowUnsavedModal(false)}
                title={modalConfig.title}
                className="max-w-md"
            >
                <p className="text-sm leading-relaxed text-ink-soft">{modalConfig.message}</p>
                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    {pendingAction === 'close' ? (
                        <Button variant="ghost" className="text-red-700 hover:bg-red-50 hover:text-red-800" onClick={() => executePendingAction()}>
                            {modalConfig.cancelLabel}
                        </Button>
                    ) : (
                        <Button variant="ghost" onClick={() => setShowUnsavedModal(false)}>
                            {modalConfig.cancelLabel}
                        </Button>
                    )}
                    <Button onClick={handleSaveAndContinue} isLoading={isSaving}>
                        {modalConfig.confirmLabel}
                    </Button>
                </div>
            </Modal>
        </>
    );
};
