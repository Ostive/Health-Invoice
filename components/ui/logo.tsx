import React from 'react';
import { cn } from '@/lib/cn';

/** Brand mark — same drawing as public/icon.svg: an invoice with a round stamp */
export function LogoMark({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 512 512" aria-hidden="true" className={cn('size-8 shrink-0', className)}>
            <rect width="512" height="512" rx="112" fill="#55309e" />
            <path d="M142 84H330L392 146V406A22 22 0 0 1 370 428H142A22 22 0 0 1 120 406V106A22 22 0 0 1 142 84Z" fill="#fff" />
            <path d="M330 84V124A22 22 0 0 0 352 146H392Z" fill="#d3c5ed" />
            <rect x="160" y="148" width="128" height="22" rx="11" fill="#d3c5ed" />
            <rect x="160" y="194" width="168" height="22" rx="11" fill="#d3c5ed" />
            <rect x="160" y="240" width="88" height="22" rx="11" fill="#d3c5ed" />
            <g transform="rotate(-12 298 334)" fill="none" stroke="#55309e" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="298" cy="334" r="62" strokeWidth="20" />
                <path d="M270 336L290 356L328 316" strokeWidth="22" />
            </g>
        </svg>
    );
}

export function Logo({ className, tone = 'dark' }: { className?: string; tone?: 'dark' | 'light' }) {
    return (
        <span className={cn('inline-flex items-center gap-2.5', className)}>
            <LogoMark />
            <span className={cn('font-display text-[15px] font-semibold tracking-tight', tone === 'light' ? 'text-white' : 'text-ink')}>
                Facturier <span className={tone === 'light' ? 'text-primary-300' : 'text-primary-600'}>Soignant</span>
            </span>
        </span>
    );
}
