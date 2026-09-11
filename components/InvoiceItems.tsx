'use client'

import React from 'react';
import { LineItem } from '../types/index';
import { Button } from './ui/button';
import { SectionLabel, fieldClass } from './ui/input';
import { Icon } from './ui/icon';
import { cn } from '@/lib/cn';
import { generateUUID } from '@/lib/uuid';
import { formatEUR, invoiceTotal } from '@/lib/format';

interface InvoiceItemsProps {
    items: LineItem[];
    onChange: (items: LineItem[]) => void;
    isReadOnly?: boolean;
}

const cellField = cn(fieldClass, 'px-2.5 py-2');

export const InvoiceItems: React.FC<InvoiceItemsProps> = ({ items, onChange, isReadOnly }) => {

    const handleItemChange = (id: string, field: keyof LineItem, value: string | number) => {
        const newItems = items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        );
        if (!isReadOnly) onChange(newItems);
    };

    const addItem = () => {
        const newItem: LineItem = {
            id: generateUUID(),
            description: '',
            quantity: 1,
            unitPrice: 0
        };
        if (!isReadOnly) onChange([...items, newItem]);
    };

    const removeItem = (id: string) => {
        if (!isReadOnly) onChange(items.filter(i => i.id !== id));
    };

    const total = invoiceTotal(items);
    const numberValue = (n: number) => (Number.isFinite(n) ? n : '');

    return (
        <section>
            <SectionLabel
                action={!isReadOnly && items.length > 0 && (
                    <Button size="sm" variant="ghost" onClick={addItem} className="-my-1 text-primary-700 hover:bg-primary-50 hover:text-primary-800">
                        <Icon name="plus" strokeWidth={2.25} />Ajouter une ligne
                    </Button>
                )}
            >
                Prestations
            </SectionLabel>

            {items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-rule-strong px-6 py-8 text-center">
                    <p className="text-sm text-ink-soft">Aucune prestation pour l’instant. Dictez vos actes ci-dessus ou ajoutez une ligne.</p>
                    {!isReadOnly && (
                        <Button size="sm" variant="outline" onClick={addItem} className="mt-4">
                            <Icon name="plus" strokeWidth={2.25} />Ajouter une ligne
                        </Button>
                    )}
                </div>
            ) : (
                <>
                    <div className="mb-1.5 hidden grid-cols-[1fr_4.5rem_6.5rem_6rem_2.25rem] gap-2 px-1 text-[12px] font-medium text-ink-faint sm:grid">
                        <span>Description</span>
                        <span className="text-right">Qté</span>
                        <span className="text-right">Prix unitaire</span>
                        <span className="text-right">Total</span>
                        <span />
                    </div>
                    <ul className="space-y-2">
                        {items.map((item) => (
                            <li key={item.id} className="grid grid-cols-[1fr_auto] gap-2 rounded-xl border border-rule bg-paper/60 p-2.5 sm:grid-cols-[1fr_4.5rem_6.5rem_6rem_2.25rem] sm:items-center sm:border-0 sm:bg-transparent sm:p-1">
                                <div className="col-span-2 sm:col-span-1">
                                    <label htmlFor={`item-desc-${item.id}`} className="sr-only">Description</label>
                                    <input
                                        id={`item-desc-${item.id}`}
                                        type="text"
                                        value={item.description}
                                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                        placeholder="Description du soin"
                                        className={cellField}
                                        disabled={isReadOnly}
                                    />
                                </div>
                                <div className="col-span-2 grid grid-cols-[4.5rem_1fr_auto_auto] items-center gap-2 sm:contents">
                                    <div>
                                        <label htmlFor={`item-qty-${item.id}`} className="sr-only">Quantité</label>
                                        <input
                                            id={`item-qty-${item.id}`}
                                            type="number"
                                            inputMode="decimal"
                                            min={0}
                                            value={numberValue(item.quantity)}
                                            onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value))}
                                            className={cn(cellField, 'text-right font-mono tabular')}
                                            placeholder="1"
                                            disabled={isReadOnly}
                                        />
                                    </div>
                                    <div className="relative">
                                        <label htmlFor={`item-price-${item.id}`} className="sr-only">Prix unitaire en euros</label>
                                        <input
                                            id={`item-price-${item.id}`}
                                            type="number"
                                            inputMode="decimal"
                                            step="0.01"
                                            min={0}
                                            value={numberValue(item.unitPrice)}
                                            onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value))}
                                            className={cn(cellField, 'pr-6 text-right font-mono tabular')}
                                            placeholder="0,00"
                                            disabled={isReadOnly}
                                        />
                                        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-ink-faint" aria-hidden="true">€</span>
                                    </div>
                                    <output className="min-w-[5.5rem] text-right font-mono text-sm font-medium tabular text-ink" aria-label="Total de la ligne">
                                        {formatEUR((item.quantity || 0) * (item.unitPrice || 0))}
                                    </output>
                                    <div className="flex justify-end">
                                        {!isReadOnly && (
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="grid size-9 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-red-50 hover:text-red-600"
                                                aria-label={`Supprimer la ligne ${item.description || 'sans description'}`}
                                            >
                                                <Icon name="trash" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            <div className="mt-5 flex justify-end">
                <dl className="w-full space-y-2 border-t-2 border-ink pt-3 sm:w-64">
                    <div className="flex justify-between text-sm">
                        <dt className="text-ink-soft">Sous-total</dt>
                        <dd className="font-mono tabular text-ink">{formatEUR(total)}</dd>
                    </div>
                    <div className="flex items-baseline justify-between">
                        <dt className="text-sm font-semibold text-ink">Total</dt>
                        <dd className="font-mono text-lg font-semibold tabular text-ink">{formatEUR(total)}</dd>
                    </div>
                </dl>
            </div>
        </section>
    );
};
