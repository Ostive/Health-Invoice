'use client'

import React from 'react';
import { useDashboard } from './DashboardContext';
import { InvoiceEditor } from '../InvoiceEditor';
import { InvoicePreview } from '../InvoicePreview';
import { Button } from '../ui/button';

export const InvoiceWorkspace = () => {
    const {
        currentInvoice, setCurrentInvoice,
        profile,
        activeTab, setActiveTab,
        isBusy, isSaving, isDeletingInvoice, isExporting, setIsExporting,
        handleNewInvoice, handleSaveInvoice, promptDeleteInvoice,
        setToast, folders, invoiceToDelete
    } = useDashboard();

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
            const message = err instanceof Error ? err.message : 'Une erreur est survenue';
            setToast({ message: `Erreur PDF: ${message}`, type: 'error' });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <>
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shrink-0 z-10 sticky top-0">
                <div className="flex items-center gap-3">
                    {/* Mobile toggle is in Layout, but we need to reserve space or handle it? 
                        Layout handles the toggle button. Here we just show the title. 
                        Actually Layout has the toggle button in the mobile header. 
                        But on Desktop, this header is the main one.
                        Wait, Layout has a mobile header. This header is for Desktop/Tablet mainly, or shared?
                        In Dashboard.tsx, this header was inside <main>.
                        In LayoutClient, I added a mobile header.
                        So this header should be hidden on mobile? Or merged?
                        Let's keep it simple. This header is the workspace toolbar.
                    */}
                    <div className="flex flex-col">
                        <h1 className="text-sm font-bold text-slate-900 truncate hidden sm:block">
                            {currentInvoice ? (currentInvoice.client.name || `Facture ${currentInvoice.number}`) : 'Tableau de bord'}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3 ml-auto">
                    {invoiceToDelete ? <span className="text-sm text-red-500 font-medium animate-pulse">Suppression en cours...</span> : (
                        <>
                            <Button variant="outline" size="sm" onClick={() => setCurrentInvoice(null)} className="hidden md:flex items-center gap-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 border-slate-200" disabled={isBusy}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                Fermer
                            </Button>
                            {currentInvoice && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => promptDeleteInvoice(currentInvoice.id, e)}
                                    className="hidden md:flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                                    disabled={isBusy}
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
                            <Button onClick={handleSaveInvoice} isLoading={isSaving} size="sm" className="bg-primary-600 hover:bg-primary-700 text-white shadow-sm"><span className="hidden sm:inline">Enregistrer</span><span className="sm:hidden">Sauvegarder</span></Button>
                            <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block"></div>
                            <Button variant="outline" size="sm" onClick={handleDownloadPDF} isLoading={isExporting} className="hidden md:flex items-center gap-2" disabled={isBusy}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>PDF</Button>
                            <Button variant="outline" size="sm" onClick={handlePrint} className="hidden md:flex" disabled={isBusy}>Imprimer</Button>
                            {currentInvoice && <button onClick={(e) => promptDeleteInvoice(currentInvoice.id, e)} className="md:hidden p-2 text-red-500 hover:bg-red-50 rounded" disabled={isBusy}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>}
                        </>
                    )}
                </div>
            </header>

            <div className="flex-1 overflow-hidden flex relative pb-16 md:pb-0">
                {currentInvoice ? (
                    <>
                        <div className={`w-full md:w-[45%] h-full overflow-y-auto bg-white md:border-r border-slate-200 ${activeTab === 'editor' ? 'block' : 'hidden md:block'}`}>
                            <InvoiceEditor invoice={currentInvoice} onChange={setCurrentInvoice} folders={folders} />
                        </div>
                        <div className={`w-full md:w-[55%] h-full bg-slate-100 overflow-y-auto flex flex-col items-center p-0 md:p-8 ${activeTab === 'preview' ? 'block' : 'hidden md:flex'}`}>
                            <div className="md:hidden flex justify-between items-center w-full px-4 py-2 bg-white sticky top-0 z-20 border-b border-slate-200 shadow-sm">
                                <Button variant="outline" size="sm" className="flex-1 mr-2" onClick={handleDownloadPDF} isLoading={isExporting}>Télécharger PDF</Button>
                                <Button variant="outline" size="sm" className="flex-1 ml-2" onClick={handlePrint}>Imprimer</Button>
                            </div>
                            <div className="w-full max-w-none md:max-w-[210mm] mx-auto transition-all duration-300 h-full md:h-auto">
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
    );
};
