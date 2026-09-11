import React from 'react'
import { cn } from '@/lib/cn'

export function SettingsHeading({ title, description }: { title: string; description?: string }) {
    return (
        <div>
            <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
            {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
        </div>
    )
}

export function SettingsCard({ title, description, children, className }: { title?: string; description?: string; children: React.ReactNode; className?: string }) {
    return (
        <section className={cn('overflow-hidden rounded-2xl border border-rule bg-white', className)}>
            {title && (
                <div className="border-b border-rule px-5 py-4 sm:px-6">
                    <h3 className="font-display text-[15px] font-semibold text-ink">{title}</h3>
                    {description && <p className="mt-0.5 text-[13px] text-ink-soft">{description}</p>}
                </div>
            )}
            <div className="p-5 sm:p-6">{children}</div>
        </section>
    )
}
