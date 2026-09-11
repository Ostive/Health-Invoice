import type { Metadata } from 'next'
import { LegalArticle } from '@/components/legal/LegalArticle'

export const metadata: Metadata = { title: 'Conditions générales d’utilisation' }

export default function CguPage() {
    return (
        <LegalArticle title="Conditions générales d’utilisation">
            <section>
                <h2>1. Objet</h2>
                <p>
                    Les présentes Conditions Générales d’Utilisation (ci-après « CGU ») ont pour objet de définir les modalités de mise à disposition des services du site « Facturier Soignant » (ci-après « le Service ») et les conditions d’utilisation du Service par l’utilisateur.
                </p>
            </section>

            <section>
                <h2>2. Description du Service</h2>
                <p>
                    Facturier Soignant est une application de démonstration permettant la génération de factures pour les professionnels de santé. L’application utilise l’intelligence artificielle pour faciliter la saisie des données.
                </p>
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <p className="font-semibold">Avertissement</p>
                    <p className="mt-1">
                        Cette application est une démonstration technique. Elle ne doit pas être utilisée pour une facturation réelle sans vérification préalable de la conformité légale et fiscale en vigueur dans votre juridiction.
                    </p>
                </div>
            </section>

            <section>
                <h2>3. Responsabilité</h2>
                <p>
                    L’éditeur du site ne saurait être tenu responsable des erreurs rencontrées sur le site, problèmes techniques, interprétation des informations publiées et conséquences de leur utilisation. L’utilisateur est seul responsable de l’exactitude des factures générées et de leur transmission aux organismes payeurs.
                </p>
            </section>

            <section>
                <h2>4. Propriété intellectuelle</h2>
                <p>
                    Tous les éléments du site (textes, images, code informatique) sont protégés par le droit d’auteur. Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site est interdite sans autorisation écrite préalable.
                </p>
            </section>

            <section>
                <h2>5. Modification des CGU</h2>
                <p>
                    L’éditeur se réserve le droit de modifier, à tout moment et sans préavis, les présentes conditions d’utilisation afin de les adapter aux évolutions du site et/ou de son exploitation.
                </p>
            </section>
        </LegalArticle>
    )
}
