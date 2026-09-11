import React from 'react';
import { InvoiceStatus } from '@/types/index';
import { cn } from '@/lib/cn';

type StampTone = 'ink' | 'paid' | 'sent' | 'late' | 'draft';
type StampSize = 'sm' | 'md' | 'lg';

const tones: Record<StampTone, string> = {
    ink: 'text-primary-700 border-primary-600',
    paid: 'text-vitale-700 border-vitale-600',
    sent: 'text-sent-700 border-sent-600',
    late: 'text-red-700 border-red-600',
    // A draft has not been stamped yet: dashed outline, no ink
    draft: 'text-ink-soft border-ink-faint border-dashed',
};

const sizes: Record<StampSize, string> = {
    sm: 'rounded-[4px] border px-1.5 py-[3px] text-[10px] tracking-[0.06em]',
    md: 'rounded-[5px] border-[1.5px] px-2 py-1 text-xs tracking-[0.08em]',
    lg: 'rounded-lg border-[3px] px-4 py-2 text-2xl tracking-[0.1em] outline-[1.5px] outline-offset-[3px] outline-current outline-solid',
};

interface StampProps {
    children: React.ReactNode;
    tone?: StampTone;
    size?: StampSize;
    /** Rotation in degrees — real stamps are never perfectly straight */
    rotate?: number;
    animated?: boolean;
    /** Delay before the stamp lands, in ms (only with `animated`) */
    delay?: number;
    grain?: boolean;
    className?: string;
}

export function Stamp({ children, tone = 'ink', size = 'sm', rotate = 0, animated = false, delay = 0, grain, className }: StampProps) {
    const withGrain = (grain ?? size !== 'sm') && tone !== 'draft';

    return (
        <span
            className={cn(
                'inline-flex select-none items-center gap-1 whitespace-nowrap font-display font-semibold uppercase leading-none',
                tones[tone],
                sizes[size],
                withGrain && 'stamp-grain',
                animated && 'animate-stamp',
                className,
            )}
            style={{
                '--stamp-rotate': `${rotate}deg`,
                rotate: animated ? undefined : `${rotate}deg`,
                animationDelay: animated && delay ? `${delay}ms` : undefined,
            } as React.CSSProperties}
        >
            {children}
        </span>
    );
}

const statusTone: Record<InvoiceStatus, StampTone> = {
    [InvoiceStatus.DRAFT]: 'draft',
    [InvoiceStatus.SENT]: 'sent',
    [InvoiceStatus.PAID]: 'paid',
    [InvoiceStatus.LATE]: 'late',
};

export function StatusStamp({ status, size = 'sm', className }: { status: InvoiceStatus; size?: StampSize; className?: string }) {
    return (
        <Stamp tone={statusTone[status] ?? 'draft'} size={size} className={className}>
            {status}
        </Stamp>
    );
}
