import { Reveal } from './Reveal'

const FEATURES = [
    {
        title: 'La dictée devient facture',
        description: 'Dites « pansement complexe chez Mme Dupont, puis prise de sang » : le patient, les actes et leur cotation sont reportés sur la facture.',
        icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z',
    },
    {
        title: 'Conforme sans y penser',
        description: 'NGAP, CCAM et mentions obligatoires (ADELI, SIRET, TVA) sont intégrées. Vous relisez, vous n’avez rien à retenir.',
        icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    },
    {
        title: 'Encaissez plus vite',
        description: 'Envoyez un lien de paiement sécurisé : vos patients règlent en deux clics depuis leur téléphone.',
        icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    },
    {
        title: 'Des factures à votre nom',
        description: 'Cinq modèles sobres, avec votre en-tête, votre spécialité et vos numéros professionnels.',
        icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
]

export function Features() {
    return (
        <section id="features" className="scroll-mt-16 border-y border-rule bg-white py-20 md:py-28">
            <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
                <Reveal className="lg:sticky lg:top-28 lg:self-start">
                    <p className="mb-4 text-[13px] font-medium text-primary-600">Fonctionnalités</p>
                    <h2 className="font-display text-3xl font-semibold leading-[1.08] text-ink md:text-[2.5rem]">
                        L’administratif en quelques secondes.
                    </h2>
                    <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft md:text-lg">
                        La facturation ne devrait pas vous prendre plus de temps que le soin. Tout ce qui peut être déduit de votre dictée l’est.
                    </p>
                </Reveal>

                <ul className="divide-y divide-rule border-y border-rule">
                    {FEATURES.map((feature, i) => (
                        <Reveal as="li" key={feature.title} delay={i * 80} className="flex gap-5 py-7">
                            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-600">
                                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d={feature.icon} /></svg>
                            </span>
                            <div>
                                <h3 className="font-display text-lg font-semibold text-ink">{feature.title}</h3>
                                <p className="mt-1.5 leading-relaxed text-ink-soft">{feature.description}</p>
                            </div>
                        </Reveal>
                    ))}
                </ul>
            </div>
        </section>
    )
}
