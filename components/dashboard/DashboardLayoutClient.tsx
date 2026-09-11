'use client'

import React from 'react';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { DashboardProvider, useDashboard } from './DashboardContext';
import { Sidebar } from './Sidebar';
import { OnboardingModal } from '../OnboardingModal';
import { Toast } from '../ui/toast';
import { DeleteConfirmationModal } from './modals/DeleteConfirmationModal';
import { FolderModal } from './modals/FolderModal';
import { DeleteFolderConfirmationModal } from './modals/DeleteFolderConfirmationModal';
import { BulkDeleteConfirmationModal } from './modals/BulkDeleteConfirmationModal';
import { Button } from '../ui/button';
import { Modal } from '../ui/modal';
import { Logo } from '../ui/logo';
import { Stamp } from '../ui/stamp';
import { Icon } from '../ui/icon';
import { PLAN_LIMITS } from '../../services/stripeService';

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
    const {
        profile,
        selectedFolderIds, selectedInvoiceIds,
        isDeletingInvoice, isDeletingFolder, isSavingFolder,
        invoiceToDelete, setInvoiceToDelete, handleDeleteInvoice,
        folderToDelete, setFolderToDelete, confirmDeleteFolder,
        showCreateFolderModal, setShowCreateFolderModal, folderToEdit, setFolderToEdit, confirmFolderAction,
        showUpgradeModal, setShowUpgradeModal, handleStartUpgrade,
        showOnboarding, setShowOnboarding, refreshProfile,
        toast, setToast,
        showBulkDeleteModal, setShowBulkDeleteModal, bulkDeleteType, confirmBulkDelete,
        onLogout,
    } = useDashboard();

    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

    return (
        <div className="relative flex h-full overflow-hidden bg-paper">
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
            <BulkDeleteConfirmationModal
                isOpen={showBulkDeleteModal}
                onClose={() => setShowBulkDeleteModal(false)}
                onConfirm={confirmBulkDelete}
                isLoading={bulkDeleteType === 'invoices' ? isDeletingInvoice : isDeletingFolder}
                count={bulkDeleteType === 'invoices' ? selectedInvoiceIds.size : selectedFolderIds.size}
                type={bulkDeleteType}
            />
            <FolderModal
                isOpen={showCreateFolderModal}
                onClose={() => { setShowCreateFolderModal(false); setFolderToEdit(null); }}
                onConfirm={confirmFolderAction}
                initialData={folderToEdit ? { name: folderToEdit.name, color: folderToEdit.color || 'blue' } : undefined}
                isLoading={isSavingFolder}
            />

            <Modal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} className="max-w-md">
                <Stamp tone="ink" size="md" rotate={-4}>Professionnel</Stamp>
                <h2 className="mt-5 font-display text-xl font-semibold text-ink">Vos {PLAN_LIMITS.free.maxInvoices} factures gratuites sont utilisées</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    Passez à l’offre Professionnel pour créer des factures sans limite et dicter autant que vous le souhaitez.
                </p>
                <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button variant="ghost" onClick={() => setShowUpgradeModal(false)}>Plus tard</Button>
                    <Button onClick={handleStartUpgrade}>Passer à l’offre Professionnel · 29 €/mois</Button>
                </div>
            </Modal>

            <aside className="z-20 hidden h-full w-72 shrink-0 border-r border-rule lg:block">
                <Sidebar />
            </aside>

            {isMobileSidebarOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    <div className="fixed inset-0 bg-ink/40 backdrop-blur-[2px] animate-in fade-in duration-200" onClick={() => setIsMobileSidebarOpen(false)} aria-hidden="true" />
                    <div role="dialog" aria-modal="true" aria-label="Menu" className="relative flex h-full w-[85vw] max-w-80 flex-col bg-white shadow-pop animate-in slide-in-from-left duration-300">
                        <div className="min-h-0 flex-1">
                            <Sidebar onClose={() => setIsMobileSidebarOpen(false)} />
                        </div>
                        <div className="space-y-1 border-t border-rule p-3">
                            <Link href="/dashboard/parametres" onClick={() => setIsMobileSidebarOpen(false)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink transition-colors hover:bg-paper">
                                <Icon name="settings" className="text-ink-faint" />Paramètres
                                {profile?.is_pro && <Stamp tone="ink" className="ml-auto">Pro</Stamp>}
                            </Link>
                            <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-700 transition-colors hover:bg-red-50">
                                <Icon name="logout" />Se déconnecter
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden">
                <div className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-rule bg-white px-2 lg:hidden">
                    <button onClick={() => setIsMobileSidebarOpen(true)} aria-label="Ouvrir le menu" className="rounded-lg p-2 text-ink transition-colors hover:bg-paper">
                        <Icon name="menu" className="size-6" />
                    </button>
                    <Logo />
                </div>

                <div className="flex flex-1 flex-col overflow-hidden">
                    {children}
                </div>
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
