'use client'

import React, { useEffect, useId, useRef } from 'react';
import { cn } from '@/lib/cn';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    className?: string;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    className = 'max-w-sm'
}) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    const titleId = useId();

    // Keep the latest onClose without re-running the open/close effect on every render
    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    });

    useEffect(() => {
        if (!isOpen) return;

        const previouslyFocused = document.activeElement as HTMLElement | null;
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCloseRef.current();
        };
        const previousOverflow = document.body.style.overflow;

        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
        if (!dialogRef.current?.contains(document.activeElement)) {
            dialogRef.current?.focus();
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = previousOverflow;
            previouslyFocused?.focus?.();
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/40 p-4 backdrop-blur-[2px] animate-in fade-in duration-200 sm:items-center"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                ref={dialogRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? titleId : undefined}
                className={cn(
                    'w-full rounded-2xl border border-rule bg-white p-6 shadow-pop outline-none',
                    'animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200',
                    className,
                )}
            >
                {title && (
                    <h2 id={titleId} className="mb-4 font-display text-lg font-semibold text-ink">{title}</h2>
                )}
                {children}
            </div>
        </div>
    );
};
