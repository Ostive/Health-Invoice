import { Reveal } from './Reveal'

const TESTIMONIALS = [
    {
        quote: 'Je passais mes dimanches à faire ma compta. Maintenant je dicte en rentrant de tournée et c’est réglé en cinq minutes.',
        name: 'Sophie M.',
        role: 'Infirmière libérale',
    },
    {
        quote: 'Pour une fois qu’un logiciel pour soignants est simple et agréable à utiliser. Mes factures ont enfin l’air professionnelles.',
        name: 'Dr Philippe R.',
        role: 'Médecin généraliste',
    },
    {
        quote: 'Le support répond vite et les factures sont impeccables. Mes patients me demandent quel outil j’utilise.',
        name: 'Thomas L.',
        role: 'Kinésithérapeute',
    },
]

const initials = (name: string) => name.replace(/^Dr\s+/, '').split(' ').map(part => part[0]).join('').slice(0, 2)

export function Testimonials() {
    return (
        <section id="testimonials" className="scroll-mt-16 py-20 md:py-28">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <Reveal className="mb-12 max-w-2xl">
                    <p className="mb-4 text-[13px] font-medium text-primary-600">Témoignages</p>
                    <h2 className="font-display text-3xl font-semibold leading-[1.08] text-ink md:text-[2.5rem]">Ils ont rendu leurs dimanches à leur famille.</h2>
                </Reveal>

                <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 scrollbar-none md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0">
                    {TESTIMONIALS.map((t, i) => (
                        <Reveal key={t.name} delay={i * 100} className="min-w-[82vw] snap-center md:min-w-0">
                            <figure className="flex h-full flex-col rounded-2xl border border-rule bg-white p-7">
                                <svg className="mb-5 size-7 text-primary-200" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true"><path d="M10 8C5.6 8 3 11.4 3 16v8h8v-8H7c0-3 1.4-4.6 3-4.6V8zm16 0c-4.4 0-7 3.4-7 8v8h8v-8h-4c0-3 1.4-4.6 3-4.6V8z" /></svg>
                                <blockquote className="grow leading-relaxed text-ink">{t.quote}</blockquote>
                                <figcaption className="mt-7 flex items-center gap-3 border-t border-rule pt-5">
                                    <span className="grid size-10 place-items-center rounded-full bg-paper font-display text-xs font-semibold text-ink-soft ring-1 ring-rule" aria-hidden="true">
                                        {initials(t.name)}
                                    </span>
                                    <span>
                                        <span className="block text-sm font-semibold text-ink">{t.name}</span>
                                        <span className="block text-[13px] text-ink-soft">{t.role}</span>
                                    </span>
                                </figcaption>
                            </figure>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    )
}
