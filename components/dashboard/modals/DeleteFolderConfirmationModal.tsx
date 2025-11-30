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
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-sm text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Supprimer le dossier ?</h3>
            <p className="text-sm text-slate-600 mb-6">
                Êtes-vous sûr de vouloir supprimer le dossier <strong>{folderName}</strong> ?
                <br /><span className="text-xs text-red-500 mt-1 block">Les factures à l'intérieur ne seront pas supprimées.</span>
            </p>
            <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1 justify-center" disabled={isLoading}>Annuler</Button>
                <Button onClick={onConfirm} className="flex-1 justify-center bg-red-600 hover:bg-red-700 text-white border-transparent" isLoading={isLoading}>Supprimer</Button>
            </div>
        </Modal>
    );
};
