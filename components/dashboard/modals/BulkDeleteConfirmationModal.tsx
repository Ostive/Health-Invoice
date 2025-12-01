import React from 'react';
import { Button } from '../../ui/button';
import { Modal } from '../../ui/modal';

interface BulkDeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
    count: number;
    type: 'invoices' | 'folders';
}

export const BulkDeleteConfirmationModal: React.FC<BulkDeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    isLoading,
    count,
    type
}) => {
    const title = type === 'invoices' ? 'Supprimer les factures ?' : 'Supprimer les dossiers ?';
    const message = type === 'invoices'
        ? `Voulez-vous vraiment supprimer ${count} factures ? Cette action est irréversible.`
        : `Voulez-vous vraiment supprimer ${count} dossiers ? Les factures à l'intérieur ne seront pas supprimées.`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-sm">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-2">{title}</h3>
            <p className="text-sm text-slate-500 text-center mb-6">{message}</p>
            <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1 justify-center" disabled={isLoading}>Annuler</Button>
                <Button onClick={onConfirm} variant="danger" className="flex-1 justify-center" isLoading={isLoading}>Supprimer</Button>
            </div>
        </Modal>
    );
};
