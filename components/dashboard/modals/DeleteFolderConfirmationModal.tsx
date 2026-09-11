import React from 'react';
import { Button } from '../../ui/button';
import { Modal } from '../../ui/modal';

interface DeleteFolderConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    folderName: string;
    isLoading: boolean;
}

export const DeleteFolderConfirmationModal: React.FC<DeleteFolderConfirmationModalProps> = ({ isOpen, onClose, onConfirm, folderName, isLoading }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Supprimer le dossier « ${folderName} » ?`}>
            <p className="text-sm leading-relaxed text-ink-soft">
                Les factures qu’il contient sont conservées et restent dans « Toutes les factures ».
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="ghost" onClick={onClose} disabled={isLoading}>Annuler</Button>
                <Button onClick={onConfirm} variant="danger" isLoading={isLoading}>Supprimer le dossier</Button>
            </div>
        </Modal>
    );
};
