import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Modal } from '../../ui/modal';

// Folder Colors Definition
export const FOLDER_COLORS = [
    { id: 'blue', bg: 'bg-blue-500', text: 'text-blue-500', ring: 'ring-blue-500' },
    { id: 'green', bg: 'bg-green-500', text: 'text-green-500', ring: 'ring-green-500' },
    { id: 'red', bg: 'bg-red-500', text: 'text-red-500', ring: 'ring-red-500' },
    { id: 'orange', bg: 'bg-orange-500', text: 'text-orange-500', ring: 'ring-orange-500' },
    { id: 'purple', bg: 'bg-purple-500', text: 'text-purple-500', ring: 'ring-purple-500' },
    { id: 'pink', bg: 'bg-pink-500', text: 'text-pink-500', ring: 'ring-pink-500' },
    { id: 'gray', bg: 'bg-slate-500', text: 'text-slate-500', ring: 'ring-slate-500' },
];

export const getFolderColorClass = (color?: string) => {
    return FOLDER_COLORS.find(c => c.id === color)?.text || 'text-blue-500';
};

export const getFolderBgClass = (color?: string) => {
    return FOLDER_COLORS.find(c => c.id === color)?.bg || 'bg-blue-500';
};

interface FolderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (name: string, color: string) => void;
    initialData?: { name: string; color: string };
    isLoading: boolean;
}

export const FolderModal: React.FC<FolderModalProps> = ({ isOpen, onClose, onConfirm, initialData, isLoading }) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState('blue');

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setName(initialData?.name || '');
            setColor(initialData?.color || 'blue');
        }
    }, [isOpen, initialData]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Modifier le dossier' : 'Nouveau Dossier'} className="max-w-sm">
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nom du dossier"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-4 focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                autoFocus
                disabled={isLoading}
            />
            <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Couleur</label>
                <div className="flex gap-3 flex-wrap">
                    {FOLDER_COLORS.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => setColor(c.id)}
                            disabled={isLoading}
                            className={`w-6 h-6 rounded-full ${c.bg} transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${color === c.id ? `ring-2 ring-offset-2 ${c.ring} scale-110` : 'hover:scale-110 hover:ring-2 hover:ring-offset-1 hover:ring-slate-200'}`}
                            aria-label={`Select color ${c.id}`}
                        />
                    ))}
                </div>
            </div>
            <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1 justify-center" disabled={isLoading}>Annuler</Button>
                <Button onClick={() => { if (name.trim()) onConfirm(name.trim(), color); }} disabled={!name.trim() || isLoading} isLoading={isLoading} className="flex-1 justify-center">{initialData ? 'Enregistrer' : 'Créer'}</Button>
            </div>
        </Modal>
    );
};
