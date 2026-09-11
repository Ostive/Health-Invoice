import Link from 'next/link'
import { buttonClass } from '@/components/ui/button-styles'
import { Reveal } from './Reveal'

export function FinalCta() {
    return (
        <section className="px-4 pb-20 sm:px-6 md:pb-28">
            <Reveal className="mx-auto max-w-6xl">
                <div className="relative overflow-hidden rounded-3xl bg-primary-950 px-6 py-14 text-center md:px-16 md:py-20">
                    <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold leading-[1.08] text-white md:text-[2.6rem]">
                        Votre prochaine facture peut prendre dix secondes.
                    </h2>
                    <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-primary-200 md:text-lg">
                        Créez votre compte, renseignez vos numéros professionnels et dictez votre premier soin.
                    </p>

                    <div className="mt-9 flex justify-center">
                        <Link
                            href="/inscription"
                            className={buttonClass({ size: 'lg', className: 'bg-white text-primary-800 shadow-none hover:bg-primary-50' })}
                        >
                            Essayer gratuitement
                            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                    </div>

                    <ul className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-primary-200">
                        {['Sans engagement', 'Sans carte bancaire', 'Données hébergées en France'].map(item => (
                            <li key={item} className="inline-flex items-center gap-2">
                                <svg className="size-4 text-vitale-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </Reveal>
        </section>
    )
}
