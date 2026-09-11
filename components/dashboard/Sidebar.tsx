'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Stamp, StatusStamp } from '../ui/stamp';
import { Logo } from '../ui/logo';
import { Icon } from '../ui/icon';
import { PLAN_LIMITS } from '../../services/stripeService';
import { getFolderColorClass, getFolderBgClass } from './modals/FolderModal';
import { useDashboard } from './DashboardContext';
import { cn } from '@/lib/cn';
import { formatEUR, invoiceTotal } from '@/lib/format';

interface SidebarProps {
    onClose?: () => void;
}

const smallField = 'w-full rounded-lg border border-rule bg-paper py-1.5 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-primary-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-600/12';

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
    const {
        user, profile, invoices, folders, currentInvoice,
        isLoadingList, isBusy, fetchError,
        selectedInvoiceIds, selectedFolderIds, selectedFolderId, setSelectedFolderId,
        searchQuery, setSearchQuery, folderSearchQuery, setFolderSearchQuery,
        showDateFilter, setShowDateFilter, dateRange, setDateRange, displayedInvoices,
        handleNewInvoice, handleInvoiceSelect,
        handleBulkDeleteInvoices, handleBulkDeleteFolders, handleCreateFolderClick,
        handleEditFolder, handleDeleteFolderClick,
        promptDeleteInvoice, toggleInvoiceSelection, toggleFolderSelection, toggleSelectAllInvoices,
        setShowUpgradeModal, handleOpenSettings, onLogout,
        currentView, setCurrentView
    } = useDashboard();

    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const visibleFolders = folders.filter(f => f.name.toLowerCase().includes(folderSearchQuery.toLowerCase()));
    const freeQuota = PLAN_LIMITS.free.maxInvoices;
    const hasDateFilter = !!(dateRange.start || dateRange.end);
    const initials = (profile?.full_name || user?.email || '?').substring(0, 2).toUpperCase();

    const listLabel = searchQuery
        ? `Résultats (${displayedInvoices.length})`
        : selectedFolderId
            ? folders.find(f => f.id === selectedFolderId)?.name
            : 'Historique';

    const emptyLabel = searchQuery
        ? 'Aucune facture ne correspond à cette recherche.'
        : hasDateFilter
            ? 'Aucune facture sur cette période.'
            : selectedFolderId ? 'Ce dossier est vide.' : 'Vos factures apparaîtront ici.';

    return (
        <div className="flex h-full flex-col bg-white">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-rule pl-5 pr-3">
                <Logo />
                <div className="flex items-center gap-1.5">
                    {profile?.is_pro ? <Stamp tone="ink" rotate={-3}>Pro</Stamp> : <Stamp tone="draft">Gratuit</Stamp>}
                    {onClose && (
                        <button onClick={onClose} aria-label="Fermer le menu" className="rounded-lg p-1.5 text-ink-faint transition-colors hover:bg-paper hover:text-ink">
                            <Icon name="close" className="size-5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="px-3 pt-3">
                <div role="tablist" aria-label="Rubrique" className="grid grid-cols-2 gap-1 rounded-lg bg-paper p-1">
                    {([
                        { id: 'invoices', label: 'Factures', icon: 'document' },
                        { id: 'patients', label: 'Patients', icon: 'users' },
                    ] as const).map(tab => (
                        <button
                            key={tab.id}
                            role="tab"
                            aria-selected={currentView === tab.id}
                            onClick={() => { setCurrentView(tab.id); onClose?.(); }}
                            className={cn(
                                'flex items-center justify-center gap-2 rounded-md py-1.5 text-[13px] font-medium transition-colors',
                                currentView === tab.id ? 'bg-white text-ink shadow-[0_1px_2px_rgb(25_27_38/0.08)] ring-1 ring-rule' : 'text-ink-soft hover:text-ink',
                            )}
                        >
                            <Icon name={tab.icon} className={currentView === tab.id ? 'text-primary-600' : undefined} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {currentView === 'invoices' && (
                <>
                    <div className="px-3 pt-3">
                        <Button onClick={() => { handleNewInvoice(); onClose?.(); }} className="w-full" disabled={isBusy}>
                            <Icon name="plus" strokeWidth={2.25} />
                            Nouvelle facture
                        </Button>
                        {!profile?.is_pro && (
                            <button onClick={() => setShowUpgradeModal(true)} className="group mt-3 block w-full text-left">
                                <span className="flex items-center justify-between text-xs text-ink-soft">
                                    <span><span className="font-mono tabular text-ink">{Math.min(invoices.length, freeQuota)}/{freeQuota}</span> factures gratuites</span>
                                    <span className="font-medium text-primary-600 opacity-0 transition-opacity group-hover:opacity-100">Passer Pro</span>
                                </span>
                                <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-paper">
                                    <span className="block h-full rounded-full bg-primary-600 transition-[width] duration-500" style={{ width: `${Math.min((invoices.length / freeQuota) * 100, 100)}%` }} />
                                </span>
                            </button>
                        )}
                    </div>

                    <div className="mt-4 shrink-0 border-t border-rule px-3 pb-2 pt-3">
                        <div className="mb-2 flex items-center justify-between px-2">
                            <span className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">Dossiers</span>
                            <div className="flex items-center gap-0.5">
                                {selectedFolderIds.size > 0 && (
                                    <button onClick={handleBulkDeleteFolders} aria-label="Supprimer les dossiers sélectionnés" className="rounded-md p-1 text-red-600 transition-colors hover:bg-red-50">
                                        <Icon name="trash" />
                                    </button>
                                )}
                                <button onClick={handleCreateFolderClick} aria-label="Créer un dossier" className="rounded-md p-1 text-ink-faint transition-colors hover:bg-paper hover:text-primary-600" disabled={isBusy}>
                                    <Icon name="plus" strokeWidth={2} />
                                </button>
                            </div>
                        </div>

                        {folders.length > 4 && (
                            <div className="relative mb-2">
                                <Icon name="search" className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint" />
                                <input
                                    type="search"
                                    value={folderSearchQuery}
                                    onChange={(e) => setFolderSearchQuery(e.target.value)}
                                    placeholder="Chercher un dossier"
                                    aria-label="Chercher un dossier"
                                    className={cn(smallField, 'pl-8 pr-2 text-[13px]')}
                                    disabled={isBusy}
                                />
                            </div>
                        )}

                        <ul className="max-h-44 space-y-px overflow-y-auto scrollbar-thin">
                            <li>
                                <button
                                    onClick={() => !isBusy && setSelectedFolderId(null)}
                                    disabled={isBusy}
                                    className={cn(
                                        'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] transition-colors disabled:opacity-50',
                                        !selectedFolderId ? 'bg-primary-50 font-medium text-primary-800' : 'text-ink-soft hover:bg-paper hover:text-ink',
                                    )}
                                >
                                    <Icon name="list" className="text-ink-faint" />
                                    Toutes les factures
                                </button>
                            </li>
                            {visibleFolders.map(f => (
                                <li
                                    key={f.id}
                                    className={cn(
                                        'group relative flex items-center rounded-md transition-colors',
                                        selectedFolderId === f.id ? 'bg-primary-50 font-medium text-primary-800' : selectedFolderIds.has(f.id) ? 'bg-primary-50/60' : 'text-ink-soft hover:bg-paper hover:text-ink',
                                    )}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedFolderIds.has(f.id)}
                                        onChange={() => toggleFolderSelection(f.id)}
                                        aria-label={`Sélectionner le dossier ${f.name}`}
                                        className={cn(
                                            'ml-2 size-3.5 shrink-0 accent-primary-600 transition-opacity',
                                            selectedFolderIds.size > 0 ? 'opacity-100' : 'opacity-0 focus:opacity-100 group-hover:opacity-100',
                                        )}
                                    />
                                    <button
                                        onClick={() => !isBusy && setSelectedFolderId(f.id)}
                                        disabled={isBusy}
                                        className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 text-[13px] disabled:opacity-50"
                                    >
                                        <svg className={cn('size-4 shrink-0', getFolderColorClass(f.color))} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
                                        <span className="truncate">{f.name}</span>
                                    </button>
                                    <div className="flex items-center pr-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                                        <button onClick={(e) => !isBusy && handleEditFolder(f, e)} disabled={isBusy} aria-label={`Renommer le dossier ${f.name}`} className="rounded p-1 text-ink-faint transition-colors hover:text-primary-600">
                                            <Icon name="edit" className="size-3.5" />
                                        </button>
                                        <button onClick={(e) => !isBusy && handleDeleteFolderClick(f, e)} disabled={isBusy} aria-label={`Supprimer le dossier ${f.name}`} className="rounded p-1 text-ink-faint transition-colors hover:text-red-600">
                                            <Icon name="trash" className="size-3.5" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}

            <div className="flex min-h-0 flex-1 flex-col border-t border-rule">
                <div className="flex gap-2 px-3 pt-3">
                    <div className="relative flex-1">
                        <Icon name="search" className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint" />
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Patient ou n° de facture"
                            aria-label="Rechercher une facture"
                            className={cn(smallField, 'pl-8 pr-2')}
                        />
                    </div>
                    <button
                        onClick={() => setShowDateFilter(!showDateFilter)}
                        aria-label="Filtrer par date"
                        aria-pressed={showDateFilter}
                        className={cn(
                            'grid size-[34px] shrink-0 place-items-center rounded-lg border transition-colors',
                            showDateFilter || hasDateFilter ? 'border-primary-200 bg-primary-50 text-primary-700' : 'border-rule text-ink-faint hover:bg-paper hover:text-ink',
                        )}
                    >
                        <Icon name="calendar" />
                    </button>
                </div>

                {showDateFilter && (
                    <div className="mx-3 mt-2 grid grid-cols-2 gap-2 rounded-lg border border-rule bg-paper p-2 animate-in fade-in slide-in-from-top-1 duration-150">
                        <label className="text-[11px] font-medium text-ink-soft">
                            Du
                            <input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} className="mt-1 w-full rounded-md border border-rule bg-white p-1 text-xs text-ink focus:border-primary-600 focus:outline-none" />
                        </label>
                        <label className="text-[11px] font-medium text-ink-soft">
                            Au
                            <input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} className="mt-1 w-full rounded-md border border-rule bg-white p-1 text-xs text-ink focus:border-primary-600 focus:outline-none" />
                        </label>
                    </div>
                )}

                <div className="flex h-10 shrink-0 items-center gap-2 px-4">
                    {selectedInvoiceIds.size > 0 ? (
                        <>
                            <input
                                type="checkbox"
                                checked={selectedInvoiceIds.size === displayedInvoices.length && displayedInvoices.length > 0}
                                onChange={toggleSelectAllInvoices}
                                aria-label="Tout sélectionner"
                                className="size-3.5 accent-primary-600"
                            />
                            <span className="text-xs font-medium text-primary-700">{selectedInvoiceIds.size} sélectionnée{selectedInvoiceIds.size > 1 ? 's' : ''}</span>
                            <button onClick={handleBulkDeleteInvoices} disabled={isBusy} className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-50">
                                <Icon name="trash" className="size-3.5" />Supprimer
                            </button>
                        </>
                    ) : (
                        <>
                            {displayedInvoices.length > 0 && (
                                <input
                                    type="checkbox"
                                    checked={false}
                                    onChange={toggleSelectAllInvoices}
                                    aria-label="Tout sélectionner"
                                    className="size-3.5 accent-primary-600 opacity-40 transition-opacity hover:opacity-100 focus:opacity-100"
                                />
                            )}
                            <span className="truncate font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">{listLabel}</span>
                            {hasDateFilter && (
                                <button onClick={() => setDateRange({ start: '', end: '' })} className="ml-auto text-[11px] font-medium text-primary-600 hover:text-primary-800">Effacer les dates</button>
                            )}
                        </>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto px-2 pb-3 scrollbar-thin">
                    {isLoadingList ? (
                        <div className="space-y-1" aria-busy="true" aria-label="Chargement des factures">
                            {[0, 1, 2, 3].map(i => (
                                <div key={i} className="rounded-lg px-3 py-3">
                                    <div className="flex justify-between"><div className="h-3.5 w-28 animate-pulse rounded bg-paper" /><div className="h-3.5 w-12 animate-pulse rounded bg-paper" /></div>
                                    <div className="mt-2 h-3 w-20 animate-pulse rounded bg-paper" />
                                </div>
                            ))}
                        </div>
                    ) : fetchError ? (
                        <p role="alert" className="mx-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">{fetchError}</p>
                    ) : displayedInvoices.length === 0 ? (
                        <div className="flex flex-col items-center px-6 py-10 text-center">
                            <Icon name="document" className="mb-3 size-7 text-rule-strong" />
                            <p className="text-[13px] text-ink-soft">{emptyLabel}</p>
                        </div>
                    ) : (
                        <ul className="space-y-px">
                            {displayedInvoices.map((inv) => {
                                const invFolder = folders.find(f => f.id === inv.folderId);
                                const isCurrent = currentInvoice?.id === inv.id;
                                const isSelected = selectedInvoiceIds.has(inv.id);
                                return (
                                    <li key={inv.id}>
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            aria-current={isCurrent || undefined}
                                            onClick={() => { handleInvoiceSelect(inv); onClose?.(); }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    handleInvoiceSelect(inv);
                                                    onClose?.();
                                                }
                                            }}
                                            className={cn(
                                                'group relative block rounded-lg border px-3 py-2.5 transition-colors',
                                                isCurrent ? 'border-primary-200 bg-primary-50' : isSelected ? 'border-transparent bg-primary-50/60' : 'border-transparent hover:bg-paper',
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={() => toggleInvoiceSelection(inv.id)}
                                                    aria-label={`Sélectionner la facture de ${inv.client.name || 'patient sans nom'}`}
                                                    className={cn(
                                                        'size-3.5 shrink-0 accent-primary-600 transition-opacity',
                                                        selectedInvoiceIds.size > 0 ? 'opacity-100' : 'opacity-0 focus:opacity-100 group-hover:opacity-100',
                                                    )}
                                                />
                                                <span className={cn('min-w-0 flex-1 truncate text-sm font-medium', isCurrent ? 'text-primary-900' : 'text-ink')}>
                                                    {inv.client.name || 'Patient sans nom'}
                                                </span>
                                                <span className="shrink-0 font-mono text-xs tabular text-ink">{formatEUR(invoiceTotal(inv.items))}</span>
                                            </div>
                                            <div className="mt-1.5 flex items-center gap-2 pl-[22px]">
                                                <StatusStamp status={inv.status} />
                                                {invFolder && (
                                                    <span className={cn('size-2 shrink-0 rounded-full', getFolderBgClass(invFolder.color))} title={invFolder.name} aria-label={`Dossier ${invFolder.name}`} />
                                                )}
                                                <span className="font-mono text-[11px] text-ink-faint">
                                                    {searchQuery && inv.number.toLowerCase().includes(searchQuery.toLowerCase())
                                                        ? inv.number
                                                        : new Date(inv.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                                </span>
                                                <button
                                                    onClick={(e) => promptDeleteInvoice(inv.id, e)}
                                                    aria-label={`Supprimer la facture de ${inv.client.name || 'patient sans nom'}`}
                                                    className="ml-auto rounded-md p-1 text-ink-faint transition-[opacity,color,background-color] hover:bg-red-50 hover:text-red-600 focus:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                                >
                                                    <Icon name="trash" className="size-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>

            <div className="hidden shrink-0 border-t border-rule p-3 lg:block">
                {!profile?.is_pro && (
                    <button onClick={() => setShowUpgradeModal(true)} className="group mb-2 flex w-full items-center gap-3 rounded-xl bg-primary-950 p-3 text-left text-white transition-colors hover:bg-primary-900">
                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/10">
                            <Icon name="bolt" className="text-primary-200" />
                        </span>
                        <span>
                            <span className="block text-[13px] font-semibold">Passer à l’offre Pro</span>
                            <span className="block text-xs text-primary-200">Factures et dictée illimitées</span>
                        </span>
                        <Icon name="chevronRight" className="ml-auto text-primary-300 transition-transform group-hover:translate-x-0.5" />
                    </button>
                )}
                <div className="relative" ref={userMenuRef}>
                    <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        aria-haspopup="menu"
                        aria-expanded={userMenuOpen}
                        className={cn('flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors', userMenuOpen ? 'bg-paper' : 'hover:bg-paper')}
                    >
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-50 font-display text-xs font-semibold text-primary-700 ring-1 ring-primary-100">
                            {initials}
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-ink">{profile?.full_name || 'Mon compte'}</span>
                            <span className="block truncate text-xs text-ink-soft">{user?.email}</span>
                        </span>
                        <Icon name="dots" className="size-5 text-ink-faint" strokeWidth={2.5} />
                    </button>
                    {userMenuOpen && (
                        <div role="menu" className="absolute bottom-full left-0 z-50 mb-2 w-full rounded-xl border border-rule bg-white p-1 shadow-pop animate-in fade-in slide-in-from-bottom-1 duration-150">
                            <button role="menuitem" onClick={handleOpenSettings} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-paper">
                                <Icon name="settings" className="text-ink-faint" />Paramètres
                            </button>
                            <div className="my-1 h-px bg-rule" />
                            <button role="menuitem" onClick={onLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-red-700 transition-colors hover:bg-red-50">
                                <Icon name="logout" />Se déconnecter
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
