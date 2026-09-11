'use client'

import React, { useState, useRef, useEffect, useId } from 'react';
import { cn } from '@/lib/cn';
import { fieldClass } from './input';

interface SelectOption<T> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

interface SelectProps<T> {
  label?: string;
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Select<T extends string | number>({
  label,
  value,
  onChange,
  options,
  placeholder = 'Sélectionner…',
  className = '',
  disabled = false,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const labelId = useId();

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleSelect = (option: SelectOption<T>) => {
    if (!disabled && !option.disabled) {
      onChange(option.value);
      setIsOpen(false);
    }
  };

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      {label && (
        <span id={labelId} className="mb-1.5 block text-[13px] font-medium text-ink-soft">
          {label}
        </span>
      )}

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={label ? labelId : undefined}
        className={cn(
          fieldClass,
          'flex items-center justify-between text-left',
          isOpen && 'border-primary-600 ring-4 ring-primary-600/12',
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className={cn('truncate', !selectedOption && 'text-ink-faint')}>
            {selectedOption?.label || placeholder}
          </span>
        </span>
        <svg
          className={cn('ml-2 size-4 shrink-0 text-ink-faint transition-transform duration-200', isOpen && 'rotate-180 text-primary-600')}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-labelledby={label ? labelId : undefined}
          className="absolute z-50 mt-1.5 max-h-64 w-auto min-w-full max-w-[300px] overflow-auto rounded-xl border border-rule bg-white p-1 shadow-pop scrollbar-thin animate-in fade-in zoom-in-95 duration-100 sm:max-w-md"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={String(option.value)}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={option.disabled}
                onClick={() => handleSelect(option)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  option.disabled && 'cursor-not-allowed opacity-50',
                  isSelected ? 'bg-primary-50 font-medium text-primary-800' : !option.disabled && 'text-ink hover:bg-paper',
                )}
              >
                <span className="flex flex-1 items-center gap-2">
                  {option.icon && <span className={isSelected ? 'text-primary-600' : 'text-ink-faint'}>{option.icon}</span>}
                  <span>
                    <span className="block leading-tight">{option.label}</span>
                    {option.description && <span className="mt-0.5 block text-xs font-normal leading-tight text-ink-faint">{option.description}</span>}
                  </span>
                </span>
                {isSelected && (
                  <svg className="size-4 shrink-0 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
