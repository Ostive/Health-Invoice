'use client'

import React from 'react';
import { User } from '@supabase/supabase-js';
import { DashboardProvider, useDashboard } from './DashboardContext';
import { Sidebar } from './Sidebar';
import { OnboardingModal } from '../OnboardingModal';
import { Toast } from '../ui/toast';
import { DeleteConfirmationModal } from './modals/DeleteConfirmationModal';
import { FolderModal } from './modals/FolderModal';
import { DeleteFolderConfirmationModal } from './modals/DeleteFolderConfirmationModal';
import { Button } from '../ui/button';
import { PLAN_LIMITS } from '../../services/stripeService';

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
    const {
        user, profile, invoices, folders,
        isBusy, isLoadingList, fetchError,
        selectedFolderIds, selectedFolderId,
        searchQuery, folderSearchQuery, showDateFilter, dateRange,
        selectedInvoiceIds, displayedInvoices, currentInvoice,
        isDeletingInvoice, isDeletingFolder, isSavingFolder,
        invoiceToDelete, setInvoiceToDelete, handleDeleteInvoice,
        folderToDelete, setFolderToDelete, confirmDeleteFolder,
        showCreateFolderModal, setShowCreateFolderModal, folderToEdit, setFolderToEdit, confirmFolderAction,
        showUpgradeModal, setShowUpgradeModal, handleStartUpgrade,
        showOnboarding, setShowOnboarding, refreshProfile,
        toast, setToast,
        // Sidebar actions
        handleNewInvoice, handleBulkDeleteFolders, handleCreateFolderClick,
        setFolderSearchQuery, setSelectedFolderId, toggleFolderSelection,
        handleEditFolder, handleDeleteFolderClick, setSearchQuery, setShowDateFilter, setDateRange,
        toggleSelectAllInvoices, handleBulkDeleteInvoices, handleInvoiceSelect,
        toggleInvoiceSelection, promptDeleteInvoice, handleOpenSettings,
        activeTab, setActiveTab
    } = useDashboard();

    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

    // Close mobile sidebar when invoice is selected (handled in handleNewInvoice/handleInvoiceSelect in context? 
    // No, context doesn't know about mobile sidebar state. We should handle it here or in Sidebar.)
    // Let's wrap the handlers to close sidebar.

    const handleNewInvoiceWrapper = () => {
        handleNewInvoice();
        setIsMobileSidebarOpen(false);
    };

    const handleInvoiceSelectWrapper = (inv: any) => {
        handleInvoiceSelect(inv);
        setIsMobileSidebarOpen(false);
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('sb-') && key.includes('-auth-token')) {
                    localStorage.removeItem(key)
                }
            })
            sessionStorage.clear()
            window.location.href = '/'
        } catch (err) {
            console.error("Logout failed:", err)
            window.location.href = '/'
        }
    }

    return (
        <div className="flex h-full bg-slate-50 overflow-hidden relative">
            <DeleteConfirmationModal
                isOpen={!!invoiceToDelete}
                onClose={() => setInvoiceToDelete(null)}
                onConfirm={handleDeleteInvoice}
                isLoading={isDeletingInvoice}
            />
            <DeleteFolderConfirmationModal
                isOpen={!!folderToDelete}
                onClose={() => setFolderToDelete(null)}
                onConfirm={confirmDeleteFolder}
                folderName={folderToDelete?.name || ''}
                isLoading={isDeletingFolder}
            />
            <FolderModal
                isOpen={showCreateFolderModal}
                onClose={() => { setShowCreateFolderModal(false); setFolderToEdit(null); }}
                onConfirm={confirmFolderAction}
                initialData={folderToEdit ? { name: folderToEdit.name, color: folderToEdit.color || 'blue' } : undefined}
                isLoading={isSavingFolder}
            />

            {showUpgradeModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Passez à la vitesse supérieure</h2>
                        <p className="text-slate-600 mb-6">Vous avez atteint la limite de {PLAN_LIMITS.free.maxInvoices} factures gratuites. Passez au plan PRO pour des factures illimitées et l'accès complet à l'IA.</p>
                        <div className="space-y-3">
                            <Button onClick={handleStartUpgrade} className="w-full py-3 text-lg">Devenir PRO - 29€/mois</Button>
                            <button onClick={() => setShowUpgradeModal(false)} className="text-slate-400 text-sm hover:text-slate-600">Non merci, je reste limité</button>
                        </div>
                    </div>
                </div>
            )}

            <aside className="hidden lg:block w-72 shrink-0 z-20 h-full shadow-xl shadow-slate-200/50">
                <Sidebar
                // Pass props that are needed or refactor Sidebar to use context. 
                // For now, passing props to match existing Sidebar interface as much as possible, 
                // but we will refactor Sidebar next to remove these props.
                // Actually, let's pass NOTHING and let Sidebar use context.
                // But Sidebar currently expects props. I will refactor Sidebar immediately after this.
                // So I will pass nothing here and expect errors until I fix Sidebar.
                />
            </aside>

            {isMobileSidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsMobileSidebarOpen(false)}></div>
                    <div className="relative w-72 bg-white h-full shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
                        <div className="h-full flex flex-col">
                            <Sidebar onClose={() => setIsMobileSidebarOpen(false)} />
                            <div className="p-4 bg-slate-50 border-t border-slate-100">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-semibold text-slate-700">Mon Compte</span>
                                    {profile?.is_pro && <span className="bg-primary-100 text-primary-800 text-xs px-2 py-0.5 rounded-full font-bold">PRO</span>}
                                </div>
                                <Button variant="outline" className="w-full justify-center mb-2" onClick={handleOpenSettings}>Paramètres</Button>
                                <Button variant="outline" className="w-full justify-center text-red-600 border-red-100 hover:bg-red-50" onClick={handleLogout}>Déconnexion</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <main className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0 bg-slate-100/50">
                {/* Mobile Header Toggle */}
                <div className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center px-4 shrink-0 sticky top-0 z-10">
                    <button onClick={() => setIsMobileSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-md mr-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                    <h1 className="text-lg font-semibold text-slate-800 truncate">Facturier.ai</h1>
                </div>

                {children}
            </main>

            <OnboardingModal
                isOpen={showOnboarding}
                onComplete={async () => {
                    await refreshProfile();
                    setShowOnboarding(false);
                }}
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
}

export function DashboardLayoutClient({ children, initialUser }: { children: React.ReactNode, initialUser: User }) {
    return (
        <DashboardProvider initialUser={initialUser}>
            <DashboardLayoutInner>{children}</DashboardLayoutInner>
        </DashboardProvider>
    );
}
