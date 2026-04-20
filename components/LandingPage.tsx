'use client'

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { LegalPageType } from './Legal';
import { Pricing } from './Pricing';
import { HowItWorks } from './landing/HowItWorks';
import { TargetAudience } from './landing/TargetAudience';
import { Stats } from './landing/Stats';
import { TrustBadges } from './landing/TrustBadges';
import { FAQ } from './landing/FAQ';
import { FinalCta } from './landing/FinalCta';
import { Reveal } from './landing/Reveal';

interface LandingPageProps {
   onLogin: () => void;
   onRegister: () => void;
   onOpenLegal: (type: LegalPageType) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onRegister, onOpenLegal }) => {
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
   const [isVideoOpen, setIsVideoOpen] = useState(false);

   // Lock body scroll when mobile menu is open
   useEffect(() => {
      if (isMobileMenuOpen) {
         document.body.style.overflow = 'hidden';
      } else {
         document.body.style.overflow = 'unset';
      }
      return () => { document.body.style.overflow = 'unset'; };
   }, [isMobileMenuOpen]);

   const scrollToSection = (id: string) => {
      setIsMobileMenuOpen(false);
      const element = document.getElementById(id);
      if (element) {
         element.scrollIntoView({ behavior: 'smooth' });
      }
   };

   return (
      <div className="min-h-screen flex flex-col bg-[#FDFDFD] font-sans selection:bg-primary-100 selection:text-primary-900 overflow-x-hidden">

         {/* Floating Navbar */}
         <div className="fixed top-2 md:top-4 left-0 right-0 z-50 flex justify-center px-2 md:px-4">
            <nav className="bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-lg shadow-slate-200/20 rounded-full px-4 py-2.5 md:px-6 md:py-3 flex items-center justify-between w-full max-w-5xl transition-all duration-200 relative">

               {/* Mobile Burger - Left */}
               <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden text-slate-600 p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors active:scale-95"
                  aria-label="Menu"
               >
                  {isMobileMenuOpen ? (
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  ) : (
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                  )}
               </button>

               {/* Logo - Absolute Center Mobile / Static Left Desktop */}
               <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:static md:transform-none md:translate-x-0 md:translate-y-0 flex items-center gap-2 cursor-pointer z-10" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold shadow-md shadow-primary-500/30 shrink-0">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <span className="text-lg font-bold text-slate-900 tracking-tight hidden sm:block">Facturier<span className="text-primary-600">Soignant</span></span>
               </div>

               {/* Desktop Links */}
               <div className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
                  <button onClick={() => scrollToSection('how-it-works')} className="hover:text-primary-600 transition-colors">Comment ça marche</button>
                  <button onClick={() => scrollToSection('features')} className="hover:text-primary-600 transition-colors">Fonctionnalités</button>
                  <button onClick={() => scrollToSection('for-who')} className="hover:text-primary-600 transition-colors">Pour qui</button>
                  <button onClick={() => scrollToSection('pricing')} className="hover:text-primary-600 transition-colors">Tarifs</button>
                  <button onClick={() => scrollToSection('faq')} className="hover:text-primary-600 transition-colors">FAQ</button>
               </div>

               {/* Actions */}
               <div className="flex items-center gap-2 md:gap-3">
                  <button onClick={onLogin} className="hidden sm:block text-sm font-bold text-slate-700 hover:text-primary-600 transition-colors px-3">Connexion</button>
                  <Button onClick={onRegister} size="sm" className="rounded-full shadow-lg shadow-primary-500/20 px-4 md:px-5 text-xs md:text-sm">Essai Gratuit</Button>
               </div>
            </nav>
         </div>

         {/* Mobile Menu Overlay */}
         {isMobileMenuOpen && (
            <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-sm pt-28 px-6 animate-in slide-in-from-top-10 fade-in duration-200">
               <div className="flex flex-col gap-6 text-xl font-medium text-slate-800">
                  <button onClick={() => scrollToSection('how-it-works')} className="border-b border-slate-100 pb-4 text-left flex justify-between items-center group">
                     Comment ça marche
                     <svg className="w-5 h-5 text-slate-300 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </button>
                  <button onClick={() => scrollToSection('features')} className="border-b border-slate-100 pb-4 text-left flex justify-between items-center group">
                     Fonctionnalités
                     <svg className="w-5 h-5 text-slate-300 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </button>
                  <button onClick={() => scrollToSection('for-who')} className="border-b border-slate-100 pb-4 text-left flex justify-between items-center group">
                     Pour qui
                     <svg className="w-5 h-5 text-slate-300 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </button>
                  <button onClick={() => scrollToSection('testimonials')} className="border-b border-slate-100 pb-4 text-left flex justify-between items-center group">
                     Témoignages
                     <svg className="w-5 h-5 text-slate-300 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </button>
                  <button onClick={() => scrollToSection('pricing')} className="border-b border-slate-100 pb-4 text-left flex justify-between items-center group">
                     Tarifs
                     <svg className="w-5 h-5 text-slate-300 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </button>
                  <button onClick={() => scrollToSection('faq')} className="border-b border-slate-100 pb-4 text-left flex justify-between items-center group">
                     FAQ
                     <svg className="w-5 h-5 text-slate-300 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </button>
                  <div className="mt-8 flex flex-col gap-4">
                     <Button onClick={onLogin} variant="outline" className="w-full justify-center py-4 text-base">Se connecter</Button>
                     <Button onClick={onRegister} className="w-full justify-center py-4 text-base shadow-xl shadow-primary-500/20">Commencer gratuitement</Button>
                  </div>
               </div>
            </div>
         )}

         <main className="flex-grow pt-28 md:pt-32">

            {/* Hero Section with 3D Perspective */}
            <section className="relative px-4 sm:px-6 lg:px-8 pb-16 md:pb-32 overflow-hidden">
               {/* Background Blurs - Reverted to Blue/Purple */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] md:w-[800px] h-[600px] bg-blue-50/80 rounded-full blur-3xl -z-10 mix-blend-multiply opacity-70"></div>
               <div className="absolute top-20 right-0 w-[300px] md:w-[400px] h-[400px] bg-purple-50/80 rounded-full blur-3xl -z-10 mix-blend-multiply opacity-70"></div>

               <div className="max-w-7xl mx-auto text-center">

                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 mb-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                     <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                     </span>
                     <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Conforme 2025</span>
                  </div>

                  {/* Main Title */}
                  <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-medium text-slate-900 tracking-tight mb-6 leading-[1.15] md:leading-[1.1]">
                     Soignez vos patients, <br />
                     <span className="italic text-primary-600/80">pas votre comptabilité.</span>
                  </h1>

                  <p className="text-base md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed font-light px-4">
                     Le premier facturier intelligent qui transforme vos notes vocales en factures conformes.
                     Conçu pour les <span className="font-medium text-slate-900">IDEL, Kinés et Médecins</span> indépendants.
                  </p>

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row justify-center gap-4 items-center mb-16 px-4">
                     <Button onClick={onRegister} className="px-8 py-4 text-lg rounded-full shadow-xl shadow-primary-600/20 hover:shadow-2xl hover:shadow-primary-600/30 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto">
                        Commencer l'essai gratuit
                     </Button>
                     <button onClick={() => setIsVideoOpen(true)} className="px-8 py-4 text-lg font-medium text-slate-600 hover:text-primary-600 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Voir la démo
                     </button>
                  </div>

                  {/* Social Proof Avatars */}
                  <div className="flex items-center justify-center gap-4 text-sm text-slate-500 mb-12 md:mb-16 scale-90 md:scale-100">
                     <div className="flex -space-x-3">
                        <img className="w-10 h-10 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64" alt="User" />
                        <img className="w-10 h-10 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64" alt="User" />
                        <img className="w-10 h-10 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64&h=64" alt="User" />
                        <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">+2k</div>
                     </div>
                     <p>Rejoignez <span className="font-bold text-slate-900">2,000+</span> soignants</p>
                  </div>

                  {/* 3D Dashboard Mockup */}
                  <div className="relative max-w-6xl mx-auto mt-8 perspective-1000 group px-2 md:px-0">
                     {/* Glow effect behind */}
                     <div className="absolute inset-0 bg-gradient-to-t from-primary-200 to-transparent opacity-30 blur-3xl -z-10 rounded-[3rem] transform scale-90 translate-y-12"></div>

                     <div className="relative bg-slate-900 rounded-2xl md:rounded-[2rem] p-2 md:p-4 shadow-2xl border border-slate-800 transform transition-transform duration-700 md:rotate-x-12 group-hover:rotate-x-0 origin-bottom">
                        <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden border border-slate-200 aspect-[16/10] md:aspect-[16/9] relative">
                           {/* Simplified UI Representation */}
                           <div className="absolute inset-0 flex">
                              {/* Sidebar */}
                              <div className="w-16 md:w-64 bg-slate-50 border-r border-slate-100 hidden md:block p-4 space-y-4">
                                 <div className="h-8 w-32 bg-slate-200 rounded animate-pulse mb-8"></div>
                                 <div className="h-10 w-full bg-primary-100 rounded-lg border border-primary-200"></div>
                                 <div className="h-6 w-full bg-slate-100 rounded"></div>
                                 <div className="h-6 w-3/4 bg-slate-100 rounded"></div>
                              </div>
                              {/* Main Content */}
                              <div className="flex-1 bg-white p-4 md:p-8">
                                 <div className="flex justify-between items-center mb-8">
                                    <div className="space-y-2">
                                       <div className="h-8 w-32 md:w-48 bg-slate-100 rounded"></div>
                                       <div className="h-4 w-24 md:w-32 bg-slate-50 rounded"></div>
                                    </div>
                                    <div className="flex gap-2">
                                       <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-slate-100"></div>
                                       <div className="h-8 w-24 md:h-10 md:w-32 bg-primary-600 rounded-lg shadow-lg shadow-primary-200"></div>
                                    </div>
                                 </div>
                                 {/* Invoice Paper */}
                                 <div className="max-w-3xl mx-auto bg-white border border-slate-200 shadow-xl rounded-lg h-full min-h-[400px] p-4 md:p-8 relative">
                                    <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-gradient-to-bl from-primary-50 to-transparent opacity-50 rounded-bl-full"></div>
                                    <div className="space-y-6">
                                       <div className="flex justify-between">
                                          <div className="h-10 w-10 md:h-12 md:w-12 bg-slate-900 rounded mb-4"></div>
                                          <div className="text-right space-y-2">
                                             <div className="h-3 md:h-4 w-16 md:w-24 bg-slate-200 rounded ml-auto"></div>
                                             <div className="h-3 md:h-4 w-24 md:w-32 bg-slate-200 rounded ml-auto"></div>
                                          </div>
                                       </div>
                                       <div className="h-px w-full bg-slate-100 my-4 md:my-8"></div>
                                       <div className="space-y-3">
                                          <div className="flex justify-between"><div className="h-3 md:h-4 w-1/2 bg-slate-100 rounded"></div><div className="h-3 md:h-4 w-16 bg-slate-100 rounded"></div></div>
                                          <div className="flex justify-between"><div className="h-3 md:h-4 w-1/3 bg-slate-100 rounded"></div><div className="h-3 md:h-4 w-16 bg-slate-100 rounded"></div></div>
                                          <div className="flex justify-between"><div className="h-3 md:h-4 w-2/3 bg-slate-100 rounded"></div><div className="h-3 md:h-4 w-16 bg-slate-100 rounded"></div></div>
                                       </div>
                                       <div className="mt-8 md:mt-12 p-4 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                                          <div className="h-3 md:h-4 w-24 bg-slate-200 rounded"></div>
                                          <div className="h-6 md:h-8 w-24 md:w-32 bg-slate-900 rounded"></div>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>
                           {/* Floating Element */}
                           <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 bg-white/90 backdrop-blur p-3 md:p-4 rounded-xl shadow-2xl border border-white/50 flex items-center gap-3 md:gap-4 animate-bounce-slow max-w-[200px] md:max-w-none">
                              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                                 <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                              </div>
                              <div>
                                 <p className="font-bold text-slate-900 text-sm md:text-base">Facture Payée</p>
                                 <p className="text-[10px] md:text-xs text-slate-500">45,00 € via Stripe</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </section>

            {/* How It Works - 3 steps workflow */}
            <HowItWorks />

            {/* Bento Grid Features Section */}
            <section id="features" className="py-16 md:py-24 bg-white relative overflow-hidden">
               <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <Reveal className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
                     <span className="inline-block text-xs font-bold text-primary-600 uppercase tracking-widest mb-4">Fonctionnalités</span>
                     <h2 className="text-3xl md:text-5xl font-serif text-slate-900 mb-4 leading-tight">L'intelligence artificielle <br /> <span className="italic text-primary-600/80">au service de votre temps.</span></h2>
                     <p className="text-slate-600 text-base md:text-lg">Nous avons repensé la facturation médicale pour qu'elle ne soit plus une corvée, mais une simple formalité de quelques secondes.</p>
                  </Reveal>

                  {/* Responsive Bento Grid - 2 cols on mobile, 3 on desktop */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 auto-rows-auto md:auto-rows-[minmax(250px,auto)]">

                     {/* Large Card Left - Full width on mobile/tablet */}
                     <div className="col-span-1 sm:col-span-2 md:col-span-2 bg-slate-50 rounded-2xl md:rounded-3xl p-6 md:p-12 border border-slate-100 relative overflow-hidden group">
                        <div className="relative z-10">
                           <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary-600 mb-4 md:mb-6">
                              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                           </div>
                           <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">Dictée Vocale Intelligente</h3>
                           <p className="text-sm md:text-base text-slate-600 max-w-md">Dites simplement "Visite chez Mme Dupont, pansement complexe et prise de sang". Notre IA structure tout, trouve les codes actes et prépare la facture.</p>
                        </div>
                        <div className="absolute right-0 bottom-0 w-1/2 h-full bg-gradient-to-l from-primary-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        {/* Abstract waveform visual */}
                        <div className="absolute bottom-6 right-6 flex items-end gap-1 h-12 md:h-16">
                           {[40, 70, 30, 80, 50, 90, 60, 40].map((h, i) => (
                              <div key={i} className="w-1.5 md:w-2 bg-primary-400 rounded-full animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}></div>
                           ))}
                        </div>
                     </div>

                     {/* Tall Card Right - Spans 2 rows on desktop, full width on mobile/tablet */}
                     <div className="col-span-1 sm:col-span-2 md:col-span-1 md:row-span-2 bg-slate-900 text-white rounded-2xl md:rounded-3xl p-6 md:p-8 border border-slate-800 relative overflow-hidden flex flex-col">
                        <div className="relative z-10 h-full flex flex-col">
                           <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-800 rounded-xl flex items-center justify-center text-white mb-4 md:mb-6">
                              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                           </div>
                           <h3 className="text-xl md:text-2xl font-bold mb-2">Toujours Conforme</h3>
                           <p className="text-slate-400 mb-8 text-sm md:text-base">NGAP, CCAM, mises à jour de la sécu... On s'occupe de tout.</p>

                           <div className="mt-auto space-y-3">
                              <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                 <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
                                 <span className="text-xs md:text-sm font-mono text-slate-300">Nomenclature 2025</span>
                              </div>
                              <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                 <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
                                 <span className="text-xs md:text-sm font-mono text-slate-300">Chiffrement AES-256</span>
                              </div>
                              <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                 <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
                                 <span className="text-xs md:text-sm font-mono text-slate-300">Hébergé en France</span>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Medium Card Bottom Left - Updated styling */}
                     <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_-3px_rgba(0,0,0,0.12),0_4px_6px_-2px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300 flex flex-row md:flex-col items-start gap-3 md:gap-0 h-full group">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 shrink-0 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                           <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                           <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1 md:mb-2">Paiement Rapide</h3>
                           <p className="text-slate-600 text-xs md:text-sm leading-relaxed">Envoyez un lien de paiement sécurisé. Vos patients vous règlent en 2 clics sur leur smartphone.</p>
                        </div>
                     </div>

                     {/* Medium Card Bottom Middle - Updated styling */}
                     <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_-3px_rgba(0,0,0,0.12),0_4px_6px_-2px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300 flex flex-row md:flex-col items-start gap-3 md:gap-0 h-full group">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shrink-0 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                           <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <div>
                           <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1 md:mb-2">Design Pro</h3>
                           <p className="text-slate-600 text-xs md:text-sm leading-relaxed">Des modèles de factures élégants qui renforcent votre image de marque auprès de votre patientèle.</p>
                        </div>
                     </div>
                  </div>
               </div>
            </section>

            {/* Target Audience - For whom */}
            <TargetAudience />

            {/* Stats Band */}
            <Stats />

            {/* Clean Testimonials */}
            <section id="testimonials" className="py-16 md:py-24 bg-slate-50">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <Reveal className="text-center mb-12 md:mb-16">
                     <span className="inline-block text-xs font-bold text-primary-600 uppercase tracking-widest mb-4">Témoignages</span>
                     <h2 className="text-3xl md:text-5xl font-serif text-slate-900 leading-tight">Recommandé par <span className="italic text-primary-600/80">vos confrères.</span></h2>
                  </Reveal>

                  <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-8 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-8 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                     <div className="min-w-[85vw] md:min-w-0 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 snap-center">
                        <div className="flex gap-1 mb-4 text-gold-400">
                           {[1, 2, 3, 4, 5].map(i => <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                        </div>
                        <p className="text-slate-700 mb-6 leading-relaxed text-sm md:text-base">"Je passais mes dimanches à faire ma compta. Avec l'IA, je prends une photo de mes notes et c'est réglé en 5 minutes. C'est bluffant."</p>
                        <div className="flex items-center gap-3">
                           <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100" className="w-10 h-10 rounded-full object-cover" alt="Sophie" />
                           <div>
                              <p className="font-bold text-sm text-slate-900">Sophie M.</p>
                              <p className="text-xs text-slate-500">Infirmière Libérale</p>
                           </div>
                        </div>
                     </div>

                     <div className="min-w-[85vw] md:min-w-0 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 transform md:scale-105 z-10 relative md:mt-0 snap-center">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full tracking-wider">Coup de cœur</div>
                        <div className="flex gap-1 mb-4 text-gold-400">
                           {[1, 2, 3, 4, 5].map(i => <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                        </div>
                        <p className="text-slate-700 mb-6 leading-relaxed text-sm md:text-base">"L'interface est d'une élégance rare. Pour une fois qu'un logiciel médical n'est pas moche et compliqué ! Bravo à l'équipe."</p>
                        <div className="flex items-center gap-3">
                           <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=100&h=100" className="w-10 h-10 rounded-full object-cover" alt="Dr Philippe" />
                           <div>
                              <p className="font-bold text-sm text-slate-900">Dr. Philippe R.</p>
                              <p className="text-xs text-slate-500">Médecin Généraliste</p>
                           </div>
                        </div>
                     </div>

                     <div className="min-w-[85vw] md:min-w-0 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 md:mt-0 snap-center">
                        <div className="flex gap-1 mb-4 text-gold-400">
                           {[1, 2, 3, 4, 5].map(i => <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                        </div>
                        <p className="text-slate-700 mb-6 leading-relaxed text-sm md:text-base">"Le support est ultra réactif et les factures sont impeccables. Mes patients me demandent souvent quel outil j'utilise."</p>
                        <div className="flex items-center gap-3">
                           <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=100&h=100" className="w-10 h-10 rounded-full object-cover" alt="Thomas" />
                           <div>
                              <p className="font-bold text-sm text-slate-900">Thomas L.</p>
                              <p className="text-xs text-slate-500">Kinésithérapeute</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </section>

            {/* Pricing */}
            <Pricing onSubscribe={onRegister} isLoggedIn={false} />

            {/* Trust Badges — Security & compliance */}
            <TrustBadges />

            {/* Expanded FAQ with categories */}
            <FAQ />

            {/* Final CTA */}
            <FinalCta onRegister={onRegister} />

         </main>

         {/* Modern Footer */}
         <footer className="bg-slate-900 text-slate-400 py-12 md:py-16 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
                  <div className="col-span-1 md:col-span-1">
                     <div className="flex items-center gap-2 mb-6 text-white">
                        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center font-bold">F</div>
                        <span className="font-bold text-lg">Facturier Soignant</span>
                     </div>
                     <p className="text-sm leading-relaxed">
                        Réinventer le quotidien des soignants indépendants grâce à la technologie. Moins de papier, plus d'humain.
                     </p>
                  </div>

                  <div className="grid grid-cols-2 gap-8 md:col-span-3 md:flex md:justify-around">
                     <div>
                        <h4 className="text-white font-bold mb-4 md:mb-6">Produit</h4>
                        <ul className="space-y-3 text-sm">
                           <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors text-left">Comment ça marche</button></li>
                           <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors text-left">Fonctionnalités</button></li>
                           <li><button onClick={() => scrollToSection('for-who')} className="hover:text-white transition-colors text-left">Pour qui</button></li>
                           <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors text-left">Tarifs</button></li>
                           <li><button onClick={() => scrollToSection('faq')} className="hover:text-white transition-colors text-left">FAQ</button></li>
                        </ul>
                     </div>

                     <div>
                        <h4 className="text-white font-bold mb-4 md:mb-6">Légal</h4>
                        <ul className="space-y-3 text-sm">
                           <li><button onClick={() => onOpenLegal('cgu')} className="hover:text-white transition-colors text-left">CGU</button></li>
                           <li><button onClick={() => onOpenLegal('privacy')} className="hover:text-white transition-colors text-left">Confidentialité</button></li>
                           <li><button onClick={() => onOpenLegal('cgu')} className="hover:text-white transition-colors text-left">Mentions Légales</button></li>
                        </ul>
                     </div>

                     <div className="col-span-2 md:col-span-1 mt-4 md:mt-0">
                        <h4 className="text-white font-bold mb-4 md:mb-6">Nous contacter</h4>
                        <p className="text-sm mb-4">Une question ? Notre équipe vous répond en moins de 2h.</p>
                        <a href="mailto:hello@facturier-soignant.fr" className="inline-flex items-center gap-2 text-white hover:text-primary-400 transition-colors font-medium">
                           hello@facturier-soignant.fr
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </a>
                     </div>
                  </div>
               </div>

               <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-sm text-slate-600 text-center md:text-left gap-4">
                  <p>&copy; {new Date().getFullYear()} Facturier Soignant AI. Fait avec passion à Paris.</p>
                  <div className="flex gap-6">
                     <a href="#" className="hover:text-white transition-colors">Twitter</a>
                     <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                     <a href="#" className="hover:text-white transition-colors">Instagram</a>
                  </div>
               </div>
            </div>
         </footer>

         {/* Video Modal */}
         {isVideoOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 md:p-8 animate-in fade-in duration-300" onClick={() => setIsVideoOpen(false)}>
               <div className="relative w-full max-w-6xl aspect-video bg-slate-950 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10" onClick={e => e.stopPropagation()}>
                  <button
                     onClick={() => setIsVideoOpen(false)}
                     className="absolute top-4 right-4 md:top-6 md:right-6 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full p-2 transition-all z-10"
                  >
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>

                  {/* Placeholder for Video - Replace with iframe or video tag */}
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900 relative overflow-hidden">
                     {/* Animated Background */}
                     <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.1),transparent_50%)]"></div>
                     </div>

                     <div className="relative z-10 flex flex-col items-center">
                        <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 ring-1 ring-white/10 shadow-xl backdrop-blur-sm">
                           <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Démonstration Vidéo</h3>
                        <p className="text-slate-400">La vidéo de présentation sera bientôt disponible.</p>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};
