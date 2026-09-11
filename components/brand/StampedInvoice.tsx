import React from 'react';
import { Stamp } from '@/components/ui/stamp';
import { cn } from '@/lib/cn';

interface StampedInvoiceProps {
    className?: string;
    style?: React.CSSProperties;
    animated?: boolean;
    /** Delay before the stamp lands, in ms */
    delay?: number;
}

/** Sample invoice stamped "Payée" — the product in one picture (illustrative NGAP amounts) */
export function StampedInvoice({ className, style, animated = false, delay = 0 }: StampedInvoiceProps) {
    return (
        <div className={cn('relative rounded-md bg-white px-6 pb-7 pt-8 text-ink shadow-sheet ring-1 ring-rule sm:px-7', className)} style={style}>
            <div className="flex items-start justify-between gap-4 border-b border-rule pb-4">
                <div>
                    <p className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-ink">Facture</p>
                    <p className="mt-1 font-mono text-xs text-ink-soft">N° 2026-0142</p>
                </div>
                <div className="text-right text-xs text-ink-soft">
                    <p className="font-medium text-ink">Mme Lefèvre</p>
                    <p>Soins à domicile</p>
                </div>
            </div>

            <table className="mt-3 w-full text-[13px]">
                <caption className="sr-only">Actes facturés</caption>
                <tbody className="divide-y divide-rule/70">
                    <tr>
                        <td className="w-16 py-2.5 font-mono text-xs font-medium text-primary-700">AMI 4</td>
                        <td className="py-2.5 text-ink">Pansement complexe</td>
                        <td className="py-2.5 text-right font-mono tabular text-ink">12,60 €</td>
                    </tr>
                    <tr>
                        <td className="py-2.5 font-mono text-xs font-medium text-primary-700">IFD</td>
                        <td className="py-2.5 text-ink">Indemnité de déplacement</td>
                        <td className="py-2.5 text-right font-mono tabular text-ink">2,75 €</td>
                    </tr>
                </tbody>
            </table>

            <div className="mt-2 flex items-baseline justify-between border-t-2 border-ink pt-3">
                <span className="text-sm font-semibold text-ink">Total</span>
                <span className="font-mono text-lg font-semibold tabular text-ink">15,35 €</span>
            </div>

            <Stamp tone="paid" size="lg" rotate={-9} animated={animated} delay={delay} className="absolute -bottom-4 right-4 bg-white/60 max-sm:scale-75 sm:right-8">
                Payée
            </Stamp>
        </div>
    );
}
