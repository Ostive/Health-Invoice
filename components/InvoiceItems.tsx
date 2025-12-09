'use client'

import React from 'react';
import { LineItem } from '../types/index';
import { Button } from './ui/button';

interface InvoiceItemsProps {
    items: LineItem[];
    onChange: (items: LineItem[]) => void;
    isReadOnly?: boolean;
}

export const InvoiceItems: React.FC<InvoiceItemsProps> = ({ items, onChange, isReadOnly }) => {

    const handleItemChange = (id: string, field: keyof LineItem, value: string | number) => {
        const newItems = items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        );
        if (!isReadOnly) onChange(newItems);
    };

    const addItem = () => {
        const newItem: LineItem = {
            id: Date.now().toString(),
            description: '',
            quantity: 1,
            unitPrice: 0
        };
        if (!isReadOnly) onChange([...items, newItem]);
    };

    const removeItem = (id: string) => {
        if (!isReadOnly) onChange(items.filter(i => i.id !== id));
    };

    return (
        <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    Prestations
                </h3>
                {!isReadOnly && (
                    <Button size="sm" onClick={addItem} variant="outline" className="text-xs py-1.5 h-8">
                        + Ajouter
                    </Button>
                )}
            </div>

            <div className="space-y-3">
                {items.length === 0 && (
                    <div className="text-center py-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-300">
                        <p className="text-sm text-slate-500">Aucune prestation.</p>
                        {!isReadOnly && <button onClick={addItem} className="text-primary-600 text-sm font-medium mt-1 hover:underline">Ajouter la première ligne</button>}
                    </div>
                )}

                {items.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row gap-3 items-start bg-slate-50 p-3 rounded-xl border border-slate-200 group hover:border-primary-200 transition-colors shadow-sm">
                        <div className="flex-1 w-full">
                            <label htmlFor={`item-desc-${item.id}`} className="block sm:hidden text-[10px] uppercase text-slate-400 font-bold mb-1">Description</label>
                            <input
                                id={`item-desc-${item.id}`}
                                type="text"
                                value={item.description}
                                onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                placeholder="Description du soin"
                                className="w-full bg-white border border-slate-200 rounded-md px-3 py-2.5 md:py-2 text-base md:text-sm focus:ring-1 focus:ring-primary-500 font-medium disabled:bg-slate-50 disabled:text-slate-500"
                                disabled={isReadOnly}
                            />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <div className="w-24 sm:w-20 shrink-0">
                                <label htmlFor={`item-qty-${item.id}`} className="block sm:hidden text-[10px] uppercase text-slate-400 font-bold mb-1">Qté</label>
                                <input
                                    id={`item-qty-${item.id}`}
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value))}
                                    className="w-full bg-white border border-slate-200 rounded-md px-3 py-2.5 md:py-2 text-base md:text-sm text-right focus:ring-1 focus:ring-primary-500"
                                    placeholder="Qté"
                                    disabled={isReadOnly}
                                />
                            </div>
                            <div className="flex-1 sm:w-24">
                                <label htmlFor={`item-price-${item.id}`} className="block sm:hidden text-[10px] uppercase text-slate-400 font-bold mb-1">Prix</label>
                                <div className="relative">
                                    <input
                                        id={`item-price-${item.id}`}
                                        type="number"
                                        value={item.unitPrice}
                                        onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value))}
                                        className="w-full bg-white border border-slate-200 rounded-md pl-3 pr-6 py-2.5 md:py-2 text-base md:text-sm text-right focus:ring-1 focus:ring-primary-500"
                                        placeholder="0.00"
                                        disabled={isReadOnly}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">€</span>
                                </div>
                            </div>
                            <div className="w-20 sm:w-24 shrink-0">
                                <label className="block sm:hidden text-[10px] uppercase text-slate-400 font-bold mb-1">Total</label>
                                <div className="w-full bg-slate-100 border border-slate-200 rounded-md px-3 py-2.5 md:py-2 text-base md:text-sm text-right text-slate-600 font-medium">
                                    {(item.quantity * item.unitPrice).toFixed(2)}€
                                </div>
                            </div>
                            <div className="flex items-end pb-1">
                                {!isReadOnly && (
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Supprimer"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 w-full sm:w-64">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-500">Sous-total</span>
                        <span className="text-sm font-medium text-slate-700">
                            {items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0).toFixed(2)} €
                        </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                        <span className="text-base font-bold text-slate-900">Total</span>
                        <span className="text-base font-bold text-primary-600">
                            {items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0).toFixed(2)} €
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
