'use client'

import React, { useState, useRef, useEffect } from 'react';

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
  placeholder = 'Sélectionner...',
  className = '',
  disabled = false,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: SelectOption<T>) => {
    if (!disabled) {
      onChange(option.value);
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-medium text-slate-600 mb-1.5">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full flex items-center justify-between
            bg-white border rounded-lg px-3 py-2.5 text-sm text-left shadow-sm transition-all
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            ${disabled ? 'bg-slate-50 cursor-not-allowed text-slate-400 border-slate-200' : 'border-slate-300 hover:border-primary-300 cursor-pointer text-slate-900'}
            ${isOpen ? 'ring-2 ring-primary-500 border-primary-500' : ''}
          `}
        >
          <span className="flex items-center gap-2 truncate">
            {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
            <span className={selectedOption ? '' : 'text-slate-400'}>
              {selectedOption?.label || placeholder}
            </span>
          </span>
          <span className="ml-2 pointer-events-none text-slate-400">
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary-500' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 min-w-full w-auto max-w-[300px] sm:max-w-md bg-white rounded-lg shadow-xl border border-slate-100 max-h-60 overflow-auto animate-in fade-in zoom-in-95 duration-100 scrollbar-thin scrollbar-thumb-slate-200">
            <div className="p-1">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={String(option.value)}
                    type="button"
                    disabled={option.disabled}
                    onClick={() => !option.disabled && handleSelect(option)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors
                      ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                      ${isSelected
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : option.disabled
                          ? 'text-slate-400'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'}
                    `}
                  >
                    <div className="flex-1 flex items-center gap-2 text-left">
                      {option.icon && <span className={isSelected ? 'text-primary-500' : 'text-slate-400'}>{option.icon}</span>}
                      <div>
                        <div className="whitespace-normal break-words leading-tight">{option.label}</div>
                        {option.description && <div className="text-[10px] text-slate-400 font-normal whitespace-normal leading-tight">{option.description}</div>}
                      </div>
                    </div>
                    {isSelected && (
                      <svg className="w-4 h-4 text-primary-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
