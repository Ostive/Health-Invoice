import React from 'react'

export function LegalArticle({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
            <h1 className="font-display text-3xl font-semibold leading-tight text-ink md:text-4xl">{title}</h1>
            <div className="mt-10 space-y-10 leading-relaxed text-ink-soft [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink [&_strong]:font-semibold [&_strong]:text-ink">
                {children}
            </div>
        </article>
    )
}
