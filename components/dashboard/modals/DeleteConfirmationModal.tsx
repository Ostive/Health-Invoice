import React from 'react';
import { Button } from '../../ui/button';
import { Modal } from '../../ui/modal';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, isLoading }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Supprimer cette facture ?">
            <p className="text-sm leading-relaxed text-ink-soft">
                Elle sera définitivement effacée de votre historique. Cette action ne peut pas être annulée.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="ghost" onClick={onClose} disabled={isLoading}>Annuler</Button>
                <Button onClick={onConfirm} variant="danger" isLoading={isLoading}>Supprimer la facture</Button>
            </div>
        </Modal>
    );
};
