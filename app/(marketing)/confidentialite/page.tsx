import type { Metadata } from 'next'
import { LegalArticle } from '@/components/legal/LegalArticle'

export const metadata: Metadata = { title: 'Politique de confidentialité' }

export default function PrivacyPage() {
    return (
        <LegalArticle title="Politique de confidentialité">
            <section>
                <h2>1. Collecte des données</h2>
                <p>Dans le cadre de l’utilisation de l’application, nous sommes amenés à collecter les données suivantes :</p>
                <ul className="mt-3 list-disc space-y-1 pl-5">
                    <li>Adresse email (pour l’authentification)</li>
                    <li>Données de facturation saisies (noms des patients, adresses, soins)</li>
                    <li>Préférences d’affichage (modèles de facture)</li>
                </ul>
            </section>

            <section>
                <h2>2. Utilisation de l’intelligence artificielle</h2>
                <p>
                    Ce service utilise l’API Google Gemini pour analyser les textes saisis et générer des factures.
                    Bien que Google applique des politiques de confidentialité strictes, nous recommandons de <strong>ne pas saisir de données de santé sensibles ou identifiables directement</strong> (nom complet et pathologie précise) dans le champ de saisie libre de l’assistant dans cette version de démonstration.
                </p>
            </section>

            <section>
                <h2>3. Stockage des données</h2>
                <p>
                    Les données sont hébergées via <strong>Supabase</strong>, une plateforme Backend-as-a-Service sécurisée. Les bases de données sont situées dans l’Union européenne ou dans des juridictions respectant le RGPD.
                </p>
            </section>

            <section>
                <h2>4. Vos droits</h2>
                <p>
                    Conformément à la réglementation RGPD, vous disposez d’un droit d’accès, de rectification, de suppression et de portabilité de vos données.
                    Vous pouvez exercer ces droits ou supprimer votre compte directement depuis l’interface de l’application ou en nous contactant.
                </p>
            </section>

            <section>
                <h2>5. Cookies</h2>
                <p>
                    Ce site utilise des cookies techniques nécessaires au fonctionnement de l’authentification (session utilisateur). Aucun cookie publicitaire tiers n’est utilisé.
                </p>
            </section>
        </LegalArticle>
    )
}
