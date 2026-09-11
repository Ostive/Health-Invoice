'use client'

import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
}

const icons: Record<ToastType, { bg: string; path: string }> = {
    success: { bg: 'bg-vitale-500', path: 'M5 13l4 4L19 7' },
    info: { bg: 'bg-sent-600', path: 'M12 8h.01M11 12h1v4h1' },
    error: { bg: 'bg-red-600', path: 'M12 8v4m0 4h.01' },
};

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 4000 }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icon = icons[type];

    return (
        <div
            role={type === 'error' ? 'alert' : 'status'}
            className="fixed inset-x-4 bottom-20 z-[100] flex items-start gap-3 rounded-xl bg-ink py-3 pl-3.5 pr-2 text-white shadow-pop animate-in fade-in slide-in-from-bottom-4 duration-300 md:inset-x-auto md:bottom-6 md:right-6 md:max-w-sm"
        >
            <span className={`mt-px grid size-5 shrink-0 place-items-center rounded-full ${icon.bg}`}>
                <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d={icon.path} />
                </svg>
            </span>
            <p className="flex-1 text-sm leading-snug">{message}</p>
            <button onClick={onClose} aria-label="Fermer la notification" className="-my-1 rounded-md p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white">
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
    );
};
