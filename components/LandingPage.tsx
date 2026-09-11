'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, buttonClass } from './ui/button';
import { Logo } from './ui/logo';
import { Modal } from './ui/modal';
import { StampedInvoice } from './brand/StampedInvoice';
import { LegalPageType } from './Legal';
import { Pricing } from './Pricing';
import { HowItWorks } from './landing/HowItWorks';
import { TargetAudience } from './landing/TargetAudience';
import { Stats } from './landing/Stats';
import { TrustBadges } from './landing/TrustBadges';
import { FAQ } from './landing/FAQ';
import { FinalCta } from './landing/FinalCta';
import { Reveal } from './landing/Reveal';
import { cn } from '@/lib/cn';

interface LandingPageProps {
   onOpenLegal: (type: LegalPageType) => void;
}

const NAV_LINKS = [
   { id: 'how-it-works', label: 'Comment ça marche' },
   { id: 'features', label: 'Fonctionnalités' },
   { id: 'for-who', label: 'Pour qui' },
   { id: 'pricing', label: 'Tarifs' },
   { id: 'faq', label: 'FAQ' },
];

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
];

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
];

const initials = (name: string) => name.replace(/^Dr\s+/, '').split(' ').map(part => part[0]).join('').slice(0, 2);

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenLegal }) => {
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
   const [isVideoOpen, setIsVideoOpen] = useState(false);
   const [isScrolled, setIsScrolled] = useState(false);

   useEffect(() => {
      document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
      return () => { document.body.style.overflow = ''; };
   }, [isMobileMenuOpen]);

   useEffect(() => {
      const onScroll = () => setIsScrolled(window.scrollY > 8);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
   }, []);

   const scrollToSection = (id: string) => {
      setIsMobileMenuOpen(false);
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
   };

   return (
      <div className="flex min-h-screen flex-col bg-paper">

         <header
            className={cn(
               'sticky top-0 z-50 border-b transition-[background-color,border-color] duration-200',
               isScrolled || isMobileMenuOpen ? 'border-rule bg-paper/90 backdrop-blur-md' : 'border-transparent bg-paper/0',
            )}
         >
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
               <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Facturier Soignant, retour en haut de page" className="rounded-md">
                  <Logo />
               </button>

               <nav aria-label="Navigation principale" className="hidden items-center gap-1 text-sm text-ink-soft lg:flex">
                  {NAV_LINKS.map(link => (
                     <button key={link.id} onClick={() => scrollToSection(link.id)} className="rounded-md px-3 py-2 transition-colors hover:bg-ink/5 hover:text-ink">
                        {link.label}
                     </button>
                  ))}
               </nav>

               <div className="flex items-center gap-2">
                  <Link href="/connexion" className="hidden rounded-md px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-ink/5 sm:inline-flex">
                     Connexion
                  </Link>
                  <Link href="/inscription" className={buttonClass({ size: 'sm', className: 'hidden sm:inline-flex' })}>
                     Essayer gratuitement
                  </Link>
                  <button
                     onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                     className="-mr-2 rounded-md p-2 text-ink transition-colors hover:bg-ink/5 lg:hidden"
                     aria-label="Menu"
                     aria-expanded={isMobileMenuOpen}
                  >
                     <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 7h16M4 12h16M4 17h16'} />
                     </svg>
                  </button>
               </div>
            </div>
         </header>

         {isMobileMenuOpen && (
            <div className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col overflow-y-auto bg-paper px-4 pb-8 pt-2 animate-in fade-in slide-in-from-top-2 duration-200 lg:hidden">
               <nav aria-label="Navigation mobile" className="flex flex-col">
                  {NAV_LINKS.map(link => (
                     <button key={link.id} onClick={() => scrollToSection(link.id)} className="flex items-center justify-between border-b border-rule py-4 text-left font-display text-lg font-medium text-ink">
                        {link.label}
                        <svg className="size-5 text-ink-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                     </button>
                  ))}
               </nav>
               <div className="mt-auto flex flex-col gap-3 pt-8">
                  <Link href="/connexion" onClick={() => setIsMobileMenuOpen(false)} className={buttonClass({ variant: 'outline', size: 'lg' })}>Se connecter</Link>
                  <Link href="/inscription" onClick={() => setIsMobileMenuOpen(false)} className={buttonClass({ size: 'lg' })}>Essayer gratuitement</Link>
               </div>
            </div>
         )}

         <main className="grow">

            {/* Hero */}
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
                        <Button size="lg" variant="ghost" onClick={() => setIsVideoOpen(true)}>
                           <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M10 9.5v5l4-2.5-4-2.5z" /></svg>
                           Voir la démo
                        </Button>
                     </div>
                     <p className="mt-4 text-[13px] text-ink-faint">Offre Découverte gratuite · sans carte bancaire · sans engagement</p>
                  </div>

                  <HeroDemo />
               </div>
            </section>

            <HowItWorks />

            {/* Features */}
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

                  <dl className="divide-y divide-rule border-y border-rule">
                     {FEATURES.map((feature, i) => (
                        <Reveal key={feature.title} delay={i * 80} className="flex gap-5 py-7">
                           <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-600">
                              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d={feature.icon} /></svg>
                           </span>
                           <div>
                              <dt className="font-display text-lg font-semibold text-ink">{feature.title}</dt>
                              <dd className="mt-1.5 leading-relaxed text-ink-soft">{feature.description}</dd>
                           </div>
                        </Reveal>
                     ))}
                  </dl>
               </div>
            </section>

            <TargetAudience />

            <Stats />

            {/* Testimonials */}
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

            <Pricing />

            <TrustBadges />

            <FAQ />

            <FinalCta />
         </main>

         <footer className="bg-ink py-14 text-white/60">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
               <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
                  <div>
                     <Logo tone="light" />
                     <p className="mt-5 max-w-xs text-sm leading-relaxed">
                        La facturation des soignants indépendants, sans paperasse. Moins d’écran, plus de temps pour vos patients.
                     </p>
                  </div>

                  <div>
                     <h4 className="mb-4 text-sm font-semibold text-white">Produit</h4>
                     <ul className="space-y-2.5 text-sm">
                        {NAV_LINKS.map(link => (
                           <li key={link.id}><button onClick={() => scrollToSection(link.id)} className="text-left transition-colors hover:text-white">{link.label}</button></li>
                        ))}
                     </ul>
                  </div>

                  <div>
                     <h4 className="mb-4 text-sm font-semibold text-white">Légal</h4>
                     <ul className="space-y-2.5 text-sm">
                        <li><button onClick={() => onOpenLegal('cgu')} className="text-left transition-colors hover:text-white">Conditions d’utilisation</button></li>
                        <li><button onClick={() => onOpenLegal('privacy')} className="text-left transition-colors hover:text-white">Confidentialité</button></li>
                        <li><button onClick={() => onOpenLegal('cgu')} className="text-left transition-colors hover:text-white">Mentions légales</button></li>
                     </ul>
                  </div>

                  <div>
                     <h4 className="mb-4 text-sm font-semibold text-white">Nous écrire</h4>
                     <p className="mb-3 text-sm">Une question sur l’outil ou votre compte ?</p>
                     <a href="mailto:hello@facturier-soignant.fr" className="inline-flex items-center gap-2 text-sm font-medium text-white underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white">
                        hello@facturier-soignant.fr
                     </a>
                  </div>
               </div>

               <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-[13px] sm:flex-row sm:items-center sm:justify-between">
                  <p>&copy; {new Date().getFullYear()} Facturier Soignant. Fait à Paris.</p>
               </div>
            </div>
         </footer>

         <Modal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} title="Démonstration vidéo" className="max-w-md">
            <p className="text-sm leading-relaxed text-ink-soft">
               La vidéo de présentation arrive bientôt. En attendant, l’Offre Découverte vous permet de dicter vos premières factures gratuitement.
            </p>
            <div className="mt-6 flex justify-end gap-3">
               <Button variant="outline" onClick={() => setIsVideoOpen(false)}>Fermer</Button>
               <Link href="/inscription" className={buttonClass()}>Essayer gratuitement</Link>
            </div>
         </Modal>
      </div>
   );
};

const WAVEFORM = [30, 55, 40, 75, 50, 90, 65, 45, 80, 35, 60, 85, 50, 70, 40, 55, 30, 45];

/** A voice note turning into a stamped invoice — the product in one picture */
const HeroDemo = () => (
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
);
