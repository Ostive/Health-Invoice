import React from 'react'
import { Reveal } from './Reveal'

const steps = [
    {
        title: 'Dictez vos actes',
        description: 'Après une tournée ou entre deux patients, dictez vos actes à voix haute. Ils sont transcrits, structurés et associés aux codes NGAP ou CCAM.',
    },
    {
        title: 'Vérifiez d’un coup d’œil',
        description: 'La facture est prête avec vos coordonnées, celles du patient et les bons tarifs. Une ligne à ajuster ? Un clic suffit.',
    },
    {
        title: 'Envoyez et encaissez',
        description: 'Une facture PDF conforme et un lien de paiement sécurisé. Vous suivez chaque règlement depuis votre tableau de bord.',
    },
]

export const HowItWorks: React.FC = () => {
    return (
        <section id="how-it-works" className="scroll-mt-16 py-20 md:py-28">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <Reveal className="mb-14 max-w-2xl">
                    <p className="mb-4 text-[13px] font-medium text-primary-600">Comment ça marche</p>
                    <h2 className="font-display text-3xl font-semibold leading-[1.08] text-ink md:text-[2.5rem]">
                        Trois gestes, de la tournée au règlement.
                    </h2>
                </Reveal>

                <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
                    {steps.map((step, i) => (
                        <Reveal as="li" key={step.title} delay={i * 110} className="border-t-2 border-ink pt-6">
                            <span className="font-mono text-sm font-medium text-primary-600">Étape {i + 1}</span>
                            <h3 className="mt-3 font-display text-xl font-semibold text-ink">{step.title}</h3>
                            <p className="mt-3 leading-relaxed text-ink-soft">{step.description}</p>
                        </Reveal>
                    ))}
                </ol>
            </div>
        </section>
    )
}
