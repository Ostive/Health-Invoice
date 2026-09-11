'use client'

import React from 'react';
import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ComponentProps<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary-600 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(28_16_55/0.35)] hover:bg-primary-700',
  secondary: 'bg-ink text-white hover:bg-ink/90',
  outline: 'border border-rule-strong bg-white text-ink hover:border-ink-faint hover:bg-paper',
  ghost: 'text-ink-soft hover:bg-ink/5 hover:text-ink',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-[13px]',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-[15px]',
  icon: 'size-9',
};

const baseClass = cn(
  'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium',
  'transition-[background-color,border-color,color,box-shadow,transform] duration-150 active:scale-[0.98]',
  'disabled:pointer-events-none disabled:opacity-50',
);

/** Button styles for elements that are not a <button>, e.g. a next/link <Link> */
export function buttonClass({ variant = 'primary', size = 'md', className }: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(baseClass, variants[variant], sizes[size], className);
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  disabled,
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      className={buttonClass({ variant, size, className })}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading && <Spinner />}
      {children}
    </button>
  );
};

export const Spinner = ({ className = 'size-4' }: { className?: string }) => (
  <svg className={cn('shrink-0 animate-spin', className)} fill="none" viewBox="0 0 24 24" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);
