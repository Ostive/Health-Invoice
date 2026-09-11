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
    const isInvoices = type === 'invoices';
    const noun = isInvoices ? (count > 1 ? 'factures' : 'facture') : (count > 1 ? 'dossiers' : 'dossier');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Supprimer ${count} ${noun} ?`}>
            <p className="text-sm leading-relaxed text-ink-soft">
                {isInvoices
                    ? 'Les factures sélectionnées seront définitivement effacées de votre historique.'
                    : 'Les factures rangées dans ces dossiers sont conservées et restent dans « Toutes les factures ».'}
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="ghost" onClick={onClose} disabled={isLoading}>Annuler</Button>
                <Button onClick={onConfirm} variant="danger" isLoading={isLoading}>Supprimer {count} {noun}</Button>
            </div>
        </Modal>
    );
};
