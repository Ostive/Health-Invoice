import React from 'react';
import { cn } from '@/lib/cn';

export const fieldClass = cn(
    'w-full rounded-lg border border-rule-strong bg-white px-3 py-2.5 text-base text-ink md:text-sm',
    'placeholder:text-ink-faint shadow-[0_1px_0_rgb(25_27_38/0.03)]',
    'transition-[border-color,box-shadow] hover:border-ink-faint',
    'focus:border-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-600/12',
    'disabled:cursor-not-allowed disabled:bg-paper disabled:text-ink-soft disabled:hover:border-rule-strong',
);

export const Input: React.FC<React.ComponentProps<'input'>> = ({ className, ...props }) => (
    <input className={cn(fieldClass, className)} {...props} />
);

export const Textarea: React.FC<React.ComponentProps<'textarea'>> = ({ className, ...props }) => (
    <textarea className={cn(fieldClass, 'resize-none', className)} {...props} />
);

export const Label: React.FC<React.ComponentProps<'label'>> = ({ className, ...props }) => (
    <label className={cn('mb-1.5 block text-[13px] font-medium text-ink-soft', className)} {...props} />
);

interface FieldProps {
    label: React.ReactNode;
    htmlFor: string;
    hint?: React.ReactNode;
    action?: React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({ label, htmlFor, hint, action, className, children }) => (
    <div className={className}>
        <div className="flex items-baseline justify-between gap-3">
            <Label htmlFor={htmlFor}>{label}</Label>
            {action}
        </div>
        {children}
        {hint && <p className="mt-1.5 text-xs text-ink-faint">{hint}</p>}
    </div>
);

/** Small uppercase heading that opens a form section */
export const SectionLabel: React.FC<{ children: React.ReactNode; action?: React.ReactNode; className?: string }> = ({ children, action, className }) => (
    <div className={cn('mb-4 flex items-center justify-between gap-3 border-b border-rule pb-2', className)}>
        <h3 className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">{children}</h3>
        {action}
    </div>
);
