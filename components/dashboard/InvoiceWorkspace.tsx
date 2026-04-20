'use client'

import React from 'react';
import { useDashboard } from './DashboardContext';
import { InvoiceEditor } from '../InvoiceEditor';
import { InvoicePreview } from '../InvoicePreview';
import { Button } from '../ui/button';
import { Modal } from '../ui/modal';

export const InvoiceWorkspace = () => {
    const {
        currentInvoice, setCurrentInvoice,
        profile,
        activeTab, setActiveTab,
        isBusy, isSaving, isDeletingInvoice, isExporting, setIsExporting,
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
                e.returnValue = ''; // Standard for Chrome/Firefox
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
            try { window.print(); } catch (e) { alert("Erreur impression."); }
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
            setToast({ message: "Action refusée : La facture doit être enregistrée en base de données avant téléchargement.", type: 'error' });
            setIsExporting(false);
            return;
        }

        if (!currentInvoice.number?.trim() || !currentInvoice.client.name?.trim()) {
            setToast({
                message: "Veuillez renseigner le numéro de facture et le nom du client.",
                type: 'error'
            });
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

            setToast({ message: 'PDF téléchargé avec succès', type: 'success' });
        } catch (err: any) {
            setToast({ message: `Erreur PDF: ${err.message}`, type: 'error' });
        } finally {
            setIsExporting(false);
        }
    };

    const handlePrint = () => {
        if (isBusy) return;

        // Strict Block for New/Unpersisted Invoices
        if (!isPersisted) {
            setToast({
                message: "Veuillez d'abord enregistrer la facture pour l'imprimer.",
                type: 'error'
            });
            return;
        }

        if (hasUnsavedChanges) {
            setPendingAction('print');
            setShowUnsavedModal(true);
            return;
        }
        try { window.print(); } catch (error) { alert("Erreur impression."); }
    };

    const handleDownloadPDF = async () => {
        if (!currentInvoice || isBusy) return;

        // Strict Block for New/Unpersisted Invoices
        if (!isPersisted) {
            setToast({
                message: "Veuillez d'abord enregistrer la facture pour la télécharger.",
                type: 'error'
            });
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
                title: "Fermer sans enregistrer ?",
                message: "Vous avez des modifications non enregistrées. Si vous fermez maintenant, elles seront perdues.",
                confirmLabel: "Enregistrer et Fermer",
                cancelLabel: "Ne pas enregistrer", // This acts as the 'Discard' action
            };
        }
        return {
            title: "Modifications non enregistrées",
            message: "Votre facture contient des modifications qui ne sont pas encore sauvegardées. Elles n'apparaîtront pas sur le document généré.",
            confirmLabel: `Enregistrer et ${pendingAction === 'print' ? 'Imprimer' : 'Télécharger'}`,
            cancelLabel: "Annuler",
        };
    }, [pendingAction]);

    const renderModalContent = () => (
        <div>
            <div className={`p-4 rounded-lg border flex gap-3 mb-6 ${pendingAction === 'close' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                <svg className={`w-6 h-6 shrink-0 ${pendingAction === 'close' ? 'text-red-600' : 'text-amber-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className={`text-sm ${pendingAction === 'close' ? 'text-red-800' : 'text-amber-800'}`}>
                    {modalConfig.message}
                </p>
            </div>
            <div className="flex items-center justify-end gap-3">
                {pendingAction === 'close' ? (
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => executePendingAction()}>
                        {modalConfig.cancelLabel}
                    </Button>
                ) : (
                    <Button variant="outline" onClick={() => setShowUnsavedModal(false)}>
                        {modalConfig.cancelLabel}
                    </Button>
                )}

                <Button onClick={handleSaveAndContinue} isLoading={isSaving} className="bg-primary-600 text-white">
                    {modalConfig.confirmLabel}
                </Button>
            </div>
        </div>
    );

    return (
        <>
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shrink-0 z-10 sticky top-0 print:hidden">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm font-bold text-slate-900 truncate hidden sm:block">
                                {currentInvoice ? (currentInvoice.client.name || `Facture ${currentInvoice.number}`) : 'Tableau de bord'}
                            </h1>
                            {currentInvoice && !isPersisted && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 animate-pulse">
                                    Non sauvegardée
                                </span>
                            )}
                            {currentInvoice && isPersisted && hasUnsavedChanges && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                    Modifiée
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3 ml-auto">
                    {invoiceToDelete ? <span className="text-sm text-red-500 font-medium animate-pulse">Suppression en cours...</span> : (
                        <>
                            <Button variant="outline" size="sm" onClick={handleClose} className="hidden md:flex items-center gap-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 border-slate-200" disabled={isBusy}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                Fermer
                            </Button>
                            {currentInvoice && (
                                <Button variant="outline" size="sm" onClick={(e) => promptDeleteInvoice(currentInvoice.id, e)} className="hidden md:flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200" disabled={isBusy}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    Supprimer
                                </Button>
                            )}
                            <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block"></div>
                            <Button onClick={handleNewInvoice} variant="outline" size="sm" className="bg-white hover:bg-primary-50 text-primary-600 border-primary-200 hover:border-primary-300 shadow-sm hidden md:flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                Nouveau
                            </Button>
                            <Button onClick={handleSaveInvoice} isLoading={isSaving} size="sm" className="hidden sm:flex bg-primary-600 hover:bg-primary-700 text-white shadow-sm">
                                Enregistrer
                            </Button>

                            {/* Mobile Save Button */}
                            <button onClick={handleSaveInvoice} className="sm:hidden p-2 text-primary-600 hover:bg-primary-50 rounded transition-colors" disabled={isSaving || isBusy}>
                                {isSaving ? (
                                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" /></svg>
                                )}
                            </button>

                            {/* Mobile PDF Button */}
                            <button
                                onClick={handleDownloadPDF}
                                className={`sm:hidden p-2 rounded transition-colors ${!isPersisted ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}
                                disabled={isExporting || isBusy || !isPersisted}
                            >
                                {isExporting ? (
                                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                )}
                            </button>

                            {/* Mobile Print Button */}
                            <button
                                onClick={handlePrint}
                                className={`sm:hidden p-2 rounded transition-colors ${!isPersisted ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}
                                disabled={isBusy || !isPersisted}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            </button>
                            <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block"></div>

                            {/* Desktop PDF Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownloadPDF}
                                isLoading={isExporting}
                                className={`hidden md:flex items-center gap-2 ${!isPersisted ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isBusy || !isPersisted}
                                title={!isPersisted ? "Enregistrez la facture pour télécharger" : ""}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                PDF
                            </Button>

                            {/* Desktop Print Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePrint}
                                className={`hidden md:flex ${!isPersisted ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isBusy || !isPersisted}
                                title={!isPersisted ? "Enregistrez la facture pour imprimer" : ""}
                            >
                                Imprimer
                            </Button>
                            {currentInvoice && <button onClick={(e) => promptDeleteInvoice(currentInvoice.id, e)} className="md:hidden p-2 text-red-500 hover:bg-red-50 rounded" disabled={isBusy}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>}
                        </>
                    )}
                </div>
            </header>

            <div className="flex-1 overflow-hidden flex relative pb-16 md:pb-0">
                {currentInvoice ? (
                    <>
                        <div className={`w-full md:w-[45%] h-full overflow-y-auto bg-white md:border-r border-slate-200 ${activeTab === 'editor' ? 'block' : 'hidden md:block'} print:hidden`}>
                            <InvoiceEditor invoice={currentInvoice} onChange={setCurrentInvoice} folders={folders} patients={patients} />
                        </div>
                        <div className={`w-full md:w-[55%] h-full bg-slate-100 overflow-y-auto flex flex-col items-center p-0 md:p-8 ${activeTab === 'preview' ? 'block' : 'hidden md:flex'} print:block print:h-auto print:overflow-visible print:bg-white print:p-0`}>
                            <div className="w-full max-w-none md:max-w-[210mm] mx-auto transition-all duration-300 h-full md:h-auto print:w-full print:max-w-none print:h-auto">
                                <InvoicePreview invoice={currentInvoice} userProfile={profile} isExporting={isExporting} />
                            </div>
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
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] print:hidden">
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

            <Modal
                isOpen={showUnsavedModal}
                onClose={() => setShowUnsavedModal(false)}
                title={modalConfig.title}
            >
                {renderModalContent()}
            </Modal>
        </>
    );
};
