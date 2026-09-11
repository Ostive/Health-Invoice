import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Modal } from '../../ui/modal';
import { Field, Input } from '../../ui/input';
import { cn } from '@/lib/cn';

// Folder Colors Definition
export const FOLDER_COLORS = [
    { id: 'blue', label: 'Bleu', bg: 'bg-blue-500', text: 'text-blue-500', ring: 'ring-blue-500' },
    { id: 'green', label: 'Vert', bg: 'bg-green-500', text: 'text-green-500', ring: 'ring-green-500' },
    { id: 'red', label: 'Rouge', bg: 'bg-red-500', text: 'text-red-500', ring: 'ring-red-500' },
    { id: 'orange', label: 'Orange', bg: 'bg-orange-500', text: 'text-orange-500', ring: 'ring-orange-500' },
    { id: 'purple', label: 'Violet', bg: 'bg-purple-500', text: 'text-purple-500', ring: 'ring-purple-500' },
    { id: 'pink', label: 'Rose', bg: 'bg-pink-500', text: 'text-pink-500', ring: 'ring-pink-500' },
    { id: 'gray', label: 'Gris', bg: 'bg-slate-500', text: 'text-slate-500', ring: 'ring-slate-500' },
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

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) onConfirm(name.trim(), color);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Modifier le dossier' : 'Nouveau dossier'}>
            <form onSubmit={submit}>
                <Field label="Nom du dossier" htmlFor="folder-name">
                    <Input
                        id="folder-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Tournée du mardi"
                        autoFocus
                        disabled={isLoading}
                    />
                </Field>

                <fieldset className="mt-5">
                    <legend className="mb-2 text-[13px] font-medium text-ink-soft">Couleur</legend>
                    <div className="flex flex-wrap gap-2.5">
                        {FOLDER_COLORS.map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => setColor(c.id)}
                                disabled={isLoading}
                                aria-label={c.label}
                                aria-pressed={color === c.id}
                                className={cn(
                                    'size-7 rounded-full transition-[transform,box-shadow] duration-150 disabled:opacity-50',
                                    c.bg,
                                    color === c.id ? cn('scale-110 ring-2 ring-offset-2', c.ring) : 'hover:scale-110',
                                )}
                            />
                        ))}
                    </div>
                </fieldset>

                <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button variant="ghost" onClick={onClose} disabled={isLoading}>Annuler</Button>
                    <Button type="submit" disabled={!name.trim()} isLoading={isLoading}>{initialData ? 'Enregistrer' : 'Créer le dossier'}</Button>
                </div>
            </form>
        </Modal>
    );
};
