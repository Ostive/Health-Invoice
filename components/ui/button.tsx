'use client'

import React from 'react';
import { cn } from '@/lib/cn';
import { buttonClass, type ButtonSize, type ButtonVariant } from './button-styles';

interface ButtonProps extends React.ComponentProps<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
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
