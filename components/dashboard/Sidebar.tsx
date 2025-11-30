import React from 'react';
import { Button } from '../ui/button';
import { Invoice, InvoiceStatus, UserProfile, Folder } from '../../types/index';
import { PLAN_LIMITS } from '../../services/stripeService';
import { getFolderColorClass, getFolderBgClass } from './modals/FolderModal';
import { User } from '@supabase/supabase-js';

interface SidebarProps {
    onClose?: () => void;
    profile: UserProfile | null;
    invoices: Invoice[];
    handleNewInvoice: () => void;
    isBusy: boolean;
    selectedFolderIds: Set<string>;
    handleBulkDeleteFolders: () => void;
    handleCreateFolderClick: () => void;
    folderSearchQuery: string;
    setFolderSearchQuery: (q: string) => void;
    setSelectedFolderId: (id: string | null) => void;
    selectedFolderId: string | null;
    folders: Folder[];
    toggleFolderSelection: (id: string) => void;
    handleEditFolder: (f: Folder, e: React.MouseEvent) => void;
    handleDeleteFolder: (f: Folder, e: React.MouseEvent) => void;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    showDateFilter: boolean;
    setShowDateFilter: (show: boolean) => void;
    dateRange: { start: string; end: string };
    setDateRange: (range: { start: string; end: string }) => void;
    selectedInvoiceIds: Set<string>;
    displayedInvoices: Invoice[];
    toggleSelectAll: () => void;
    handleBulkDelete: () => void;
    isDeletingInvoice: boolean;
    isLoadingList: boolean;
    fetchError: string | null;
    handleInvoiceSelect: (inv: Invoice) => void;
    currentInvoice: Invoice | null;
    showSettings?: boolean;
    toggleInvoiceSelection: (id: string) => void;
    promptDelete: (id: string, e: React.MouseEvent) => void;
    setShowUpgradeModal: (show: boolean) => void;
    userMenuRef: React.RefObject<HTMLDivElement | null>;
    userMenuOpen: boolean;
    setUserMenuOpen: (open: boolean) => void;
    user: User;
    handleOpenSettings: () => void;
    onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    onClose,
    profile,
    invoices,
    handleNewInvoice,
    isBusy,
    selectedFolderIds,
    handleBulkDeleteFolders,
    handleCreateFolderClick,
    folderSearchQuery,
    setFolderSearchQuery,
    setSelectedFolderId,
    selectedFolderId,
    folders,
    toggleFolderSelection,
    handleEditFolder,
    handleDeleteFolder,
    searchQuery,
    setSearchQuery,
    showDateFilter,
    setShowDateFilter,
    dateRange,
    setDateRange,
    selectedInvoiceIds,
    displayedInvoices,
    toggleSelectAll,
    handleBulkDelete,
    isDeletingInvoice,
    isLoadingList,
    fetchError,
    handleInvoiceSelect,
    currentInvoice,
    showSettings,
    toggleInvoiceSelection,
    promptDelete,
    setShowUpgradeModal,
    userMenuRef,
    userMenuOpen,
    setUserMenuOpen,
    user,
    handleOpenSettings,
    onLogout
}) => {
    // Skeleton Loader Component
    const SkeletonInvoiceItem = () => (
        <div className="flex flex-col p-3 rounded-lg border border-slate-100 bg-white mb-1">
            <div className="flex justify-between items-center mb-2">
                <div className="h-4 w-24 bg-slate-100 rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-slate-100 rounded-full animate-pulse"></div>
            </div>
            <div className="flex justify-between items-center">
                <div className="h-3 w-20 bg-slate-50 rounded animate-pulse"></div>
                <div className="h-3 w-16 bg-slate-50 rounded animate-pulse"></div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-white border-r border-slate-200">
            <div className="h-16 flex items-center px-6 border-b border-slate-100 shrink-0 justify-between">
                <span className="text-lg font-bold text-slate-900">Facturier<span className="text-primary-600">.ai</span></span>
                <div className="flex items-center gap-3">
                    {profile?.is_pro ? (
                        <span className="bg-gradient-to-r from-gold-400 to-gold-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">PRO</span>
                    ) : (
                        <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-slate-200">Gratuit</span>
                    )}
                    {onClose && (
                        <button onClick={onClose} className="p-1 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    )}
                </div>
            </div>

            <div className="p-4 border-b border-slate-100 shrink-0 hidden lg:block">
                <Button onClick={handleNewInvoice} className="w-full justify-center shadow-sm group" disabled={isBusy}>
                    <svg className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Nouvelle Facture
                </Button>
                {!profile?.is_pro && (
                    <div className="mt-3 text-center group cursor-help">
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1 overflow-hidden">
                            <div className="bg-primary-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min((invoices.length / PLAN_LIMITS.free.maxInvoices) * 100, 100)}%` }}></div>
                        </div>
                        <p className="text-[10px] text-slate-400 group-hover:text-primary-600 transition-colors">
                            {invoices.length} / {PLAN_LIMITS.free.maxInvoices} factures gratuites
                        </p>
                    </div>
                )}
            </div>

            {/* Folders Section */}
            <div className="px-3 py-2 border-b border-slate-100 shrink-0">
                <div className="flex items-center justify-between px-3 mb-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dossiers</span>
                    <div className="flex items-center gap-1">
                        {selectedFolderIds.size > 0 && (
                            <button onClick={handleBulkDeleteFolders} className="text-red-400 hover:text-red-600 mr-2" title="Supprimer la sélection">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        )}
                        <button onClick={handleCreateFolderClick} className="text-slate-400 hover:text-primary-600" title="Créer un dossier" disabled={isBusy}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        </button>
                    </div>
                </div>
                <div className="px-3 mb-2">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <svg className="h-3 w-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input
                            type="text"
                            value={folderSearchQuery}
                            onChange={(e) => setFolderSearchQuery(e.target.value)}
                            placeholder="Chercher un dossier..."
                            className="w-full pl-7 pr-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all"
                            disabled={isBusy}
                        />
                    </div>
                </div>
                <div className="space-y-0.5 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 pr-1">
                    <button
                        onClick={() => !isBusy && setSelectedFolderId(null)}
                        disabled={isBusy}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${!selectedFolderId ? 'bg-primary-50 text-primary-700 font-medium' : 'text-slate-600 hover:bg-slate-50'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                        Tous les documents
                    </button>
                    {folders.filter(f => f.name.toLowerCase().includes(folderSearchQuery.toLowerCase())).map(f => (
                        <div
                            key={f.id}
                            className={`group relative flex items-center w-full rounded-md transition-colors ${selectedFolderId === f.id ? 'bg-primary-50 text-primary-700 font-medium' : selectedFolderIds.has(f.id) ? 'bg-primary-50/50' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <div className="pl-2 pr-1 flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selectedFolderIds.has(f.id)}
                                    onChange={(e) => { e.stopPropagation(); toggleFolderSelection(f.id); }}
                                    className={`rounded border-slate-300 text-primary-600 focus:ring-primary-500 w-3.5 h-3.5 transition-opacity ${selectedFolderIds.size > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                />
                            </div>
                            <button
                                onClick={() => !isBusy && setSelectedFolderId(f.id)}
                                disabled={isBusy}
                                className="flex-1 flex items-center gap-2 px-2 py-1.5 text-sm min-w-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className={`w-4 h-4 shrink-0 ${getFolderColorClass(f.color)}`} fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
                                <span className="truncate">{f.name}</span>
                            </button>
                            <div className="flex items-center gap-1 pr-2">
                                <button onClick={(e) => !isBusy && handleEditFolder(f, e)} disabled={isBusy} className="p-1 text-slate-300 hover:text-primary-600 rounded disabled:opacity-50 transition-colors" title="Modifier">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                                <button onClick={(e) => !isBusy && handleDeleteFolder(f, e)} disabled={isBusy} className="p-1 text-slate-300 hover:text-red-600 rounded disabled:opacity-50 transition-colors" title="Supprimer">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
                <div className="px-3 mb-2 mt-2 flex gap-2">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Recherche..."
                            className="w-full pl-9 pr-8 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => setShowDateFilter(!showDateFilter)}
                        className={`p-1.5 rounded-md border transition-all ${showDateFilter || dateRange.start || dateRange.end ? 'bg-primary-50 border-primary-200 text-primary-600' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                        title="Filtrer par date"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </button>
                </div>

                {showDateFilter && (
                    <div className="px-3 mb-2 grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 fade-in duration-200 bg-slate-50 p-2 rounded-lg border border-slate-100 mx-2">
                        <div>
                            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Du</label>
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                className="w-full text-xs p-1 border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Au</label>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                className="w-full text-xs p-1 border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                        </div>
                    </div>
                )}

                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2 flex justify-between items-center h-8">
                    {selectedInvoiceIds.size > 0 ? (
                        <div className="flex items-center gap-2 w-full animate-in fade-in duration-200">
                            <input
                                type="checkbox"
                                checked={selectedInvoiceIds.size === displayedInvoices.length && displayedInvoices.length > 0}
                                onChange={toggleSelectAll}
                                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-primary-600">{selectedInvoiceIds.size} sélectionné(s)</span>
                            <div className="flex-1"></div>
                            <button
                                onClick={handleBulkDelete}
                                disabled={isDeletingInvoice}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                Supprimer
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2">
                                {displayedInvoices.length > 0 && (
                                    <input
                                        type="checkbox"
                                        checked={false}
                                        onChange={toggleSelectAll}
                                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 opacity-50 hover:opacity-100 transition-opacity"
                                        title="Tout sélectionner"
                                    />
                                )}
                                <span>
                                    {searchQuery
                                        ? `Résultats (${displayedInvoices.length})`
                                        : selectedFolderId
                                            ? `Dans "${folders.find(f => f.id === selectedFolderId)?.name}"`
                                            : 'Historique'}
                                </span>
                            </div>
                            {(dateRange.start || dateRange.end) && (
                                <button onClick={() => setDateRange({ start: '', end: '' })} className="text-[9px] text-red-400 hover:text-red-600">Effacer dates</button>
                            )}
                        </>
                    )}
                </div>

                {isLoadingList ? (
                    <div className="animate-in fade-in duration-300 space-y-2">
                        <SkeletonInvoiceItem /><SkeletonInvoiceItem /><SkeletonInvoiceItem />
                    </div>
                ) : fetchError ? (
                    <div className="p-4 text-center text-red-500 text-xs bg-red-50 rounded mx-2 break-words border border-red-100">⚠️ {fetchError}</div>
                ) : displayedInvoices.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm italic flex flex-col items-center">
                        <svg className="w-8 h-8 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        {searchQuery
                            ? 'Aucun résultat'
                            : dateRange.start || dateRange.end
                                ? 'Aucune facture sur cette période'
                                : selectedFolderId ? 'Dossier vide' : 'Aucune facture'}
                    </div>
                ) : (
                    displayedInvoices.map((inv) => {
                        const invFolder = folders.find(f => f.id === inv.folderId);
                        return (
                            <div
                                key={inv.id}
                                onClick={() => handleInvoiceSelect(inv)}
                                className={`group relative flex flex-col p-3 rounded-lg cursor-pointer border transition-all duration-200 ${currentInvoice?.id === inv.id && !showSettings
                                    ? 'bg-primary-50 border-primary-200 shadow-sm z-10'
                                    : selectedInvoiceIds.has(inv.id)
                                        ? 'bg-primary-50/50 border-primary-100'
                                        : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1 pr-6">
                                    <div className="flex items-center gap-2 w-full overflow-hidden">
                                        <input
                                            type="checkbox"
                                            checked={selectedInvoiceIds.has(inv.id)}
                                            onChange={(e) => { e.stopPropagation(); toggleInvoiceSelection(inv.id); }}
                                            className={`rounded border-slate-300 text-primary-600 focus:ring-primary-500 transition-opacity ${selectedInvoiceIds.size > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                        />
                                        <span className={`font-medium text-sm truncate ${currentInvoice?.id === inv.id && !showSettings ? 'text-primary-900' : 'text-slate-900'}`}>{inv.client.name || 'Sans nom'}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${inv.status === InvoiceStatus.PAID ? 'bg-green-100 text-green-800' :
                                            inv.status === InvoiceStatus.LATE ? 'bg-red-100 text-red-800 font-bold' :
                                                inv.status === InvoiceStatus.SENT ? 'bg-blue-100 text-blue-800' :
                                                    'bg-slate-100 text-slate-600'
                                            }`}>{inv.status}</span>
                                        {invFolder && (
                                            <span className={`w-2 h-2 rounded-full ${getFolderBgClass(invFolder.color)}`} title={invFolder.name}></span>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] text-slate-400">{new Date(inv.date).toLocaleDateString()}</span>
                                        {searchQuery && inv.number.toLowerCase().includes(searchQuery.toLowerCase()) && (
                                            <span className="text-[9px] text-primary-500 font-mono">{inv.number}</span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => promptDelete(inv.id, e)}
                                    className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all md:opacity-0 md:group-hover:opacity-100 opacity-100"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="p-3 border-t border-slate-100 shrink-0 bg-slate-50/50 hidden lg:block">
                {!profile?.is_pro && (
                    <div className="mb-3 p-3 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl text-white shadow-md cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all group" onClick={() => setShowUpgradeModal(true)}>
                        <div className="flex items-center gap-2 mb-1.5">
                            <div className="p-1 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                                <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wide">Passez PRO</span>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-tight font-medium">Factures & IA illimitées</p>
                    </div>
                )}
                <div className="relative" ref={userMenuRef}>
                    <button onClick={() => setUserMenuOpen(!userMenuOpen)} className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all border ${userMenuOpen ? 'bg-white border-primary-200 shadow-md ring-2 ring-primary-100' : 'bg-transparent border-transparent hover:bg-white hover:shadow-sm hover:border-slate-200'}`}>
                        <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-primary-700 font-bold text-sm shadow-sm">
                            {profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : user.email?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden text-left">
                            <p className="text-sm font-semibold text-slate-900 truncate">{profile?.full_name || 'Utilisateur'}</p>
                            <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                        </div>
                        <div className="text-slate-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg></div>
                    </button>
                    {userMenuOpen && (
                        <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-xl shadow-xl border border-slate-100 p-1 animate-in slide-in-from-bottom-2 fade-in duration-200 z-50">
                            <button onClick={handleOpenSettings} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary-700 rounded-lg transition-colors text-left"><svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>Paramètres</button>
                            <div className="h-px bg-slate-100 my-1"></div>
                            <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>Déconnexion</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
