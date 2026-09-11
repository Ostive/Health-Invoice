import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

const variants: Record<ButtonVariant, string> = {
    primary: 'bg-primary-600 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(28_16_55/0.35)] hover:bg-primary-700',
    secondary: 'bg-ink text-white hover:bg-ink/90',
    outline: 'border border-rule-strong bg-white text-ink hover:border-ink-faint hover:bg-paper',
    ghost: 'text-ink-soft hover:bg-ink/5 hover:text-ink',
    danger: 'bg-red-600 text-white hover:bg-red-700',
}

const sizes: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-[13px]',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-[15px]',
    icon: 'size-9',
}

const baseClass = cn(
    'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium',
    'transition-[background-color,border-color,color,box-shadow,transform] duration-150 active:scale-[0.98]',
    'disabled:pointer-events-none disabled:opacity-50',
)

/**
 * Button styles as a plain function (no 'use client'), so Server Components can style
 * a next/link <Link> as a button.
 */
export function buttonClass({ variant = 'primary', size = 'md', className }: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
    return cn(baseClass, variants[variant], sizes[size], className)
}
