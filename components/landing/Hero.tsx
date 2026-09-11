import Link from 'next/link'
import { buttonClass } from '@/components/ui/button-styles'
import { StampedInvoice } from '@/components/brand/StampedInvoice'
import { DemoVideoButton } from './DemoVideoButton'

const WAVEFORM = [30, 55, 40, 75, 50, 90, 65, 45, 80, 35, 60, 85, 50, 70, 40, 55, 30, 45]

export function Hero() {
    return (
        <section className="relative overflow-hidden">
            <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-10 sm:px-6 md:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:pb-28">
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <p className="mb-6 inline-flex items-center gap-2 text-[13px] font-medium text-ink-soft">
                        <span className="size-1.5 rounded-full bg-vitale-500" aria-hidden="true" />
                        Pour les infirmiers, kinés et médecins libéraux
                    </p>
                    <h1 className="font-display text-[2.35rem] font-semibold leading-[1.04] text-ink sm:text-[3.2rem] lg:text-[3.35rem]">
                        Dictez la tournée.<br />
                        <span className="text-primary-600">La facture suit.</span>
                    </h1>
                    <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">
                        Racontez vos soins comme vous le feriez à un collègue. Facturier Soignant reconnaît les actes, applique la nomenclature et prépare une facture prête à envoyer.
                    </p>
                    <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Link href="/inscription" className={buttonClass({ size: 'lg' })}>
                            Essayer gratuitement
                            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                        </Link>
                        <DemoVideoButton />
                    </div>
                    <p className="mt-4 text-[13px] text-ink-faint">Offre Découverte gratuite · sans carte bancaire · sans engagement</p>
                </div>

                <HeroDemo />
            </div>
        </section>
    )
}

/** A voice note turning into a stamped invoice — the product in one picture */
function HeroDemo() {
    return (
        <figure className="relative mx-auto w-full max-w-[500px] pb-6" aria-label="Exemple : une note vocale transformée en facture tamponnée « Payée »">
            <div
                className="relative z-10 w-[90%] rounded-2xl border border-rule bg-white p-4 shadow-sheet animate-in fade-in slide-in-from-bottom-3 duration-700 sm:p-5"
                style={{ animationDelay: '150ms', animationFillMode: 'backwards' }}
            >
                <div className="mb-3 flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-2 text-xs font-medium text-ink-soft">
                        <span className="grid size-6 place-items-center rounded-full bg-primary-600 text-white">
                            <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.25" d="M19 11a7 7 0 01-14 0m7 7v3m0-7a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                        </span>
                        Note vocale · 0:09
                    </span>
                    <span className="flex h-6 items-center gap-[3px]" aria-hidden="true">
                        {WAVEFORM.map((h, i) => (
                            <span key={i} className="w-[3px] rounded-full bg-primary-300" style={{ height: `${h}%` }} />
                        ))}
                    </span>
                </div>
                <p className="font-mono text-[13px] leading-relaxed text-ink">
                    « Passage chez <mark className="surligne bg-transparent text-inherit">Mme Lefèvre</mark> ce matin, <mark className="surligne bg-transparent text-inherit">pansement complexe</mark>, et je compte le <mark className="surligne bg-transparent text-inherit">déplacement</mark>. »
                </p>
            </div>

            <StampedInvoice
                animated
                delay={1100}
                className="-mt-3 ml-auto w-[94%] rotate-[1.2deg] animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: '400ms', animationFillMode: 'backwards' }}
            />
        </figure>
    )
}
