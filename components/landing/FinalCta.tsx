'use client'

import React from 'react'
import { Button } from '../ui/button'
import { Reveal } from './Reveal'

interface FinalCtaProps {
    onRegister: () => void
}

export const FinalCta: React.FC<FinalCtaProps> = ({ onRegister }) => {
    return (
        <section className="py-20 md:py-28 bg-white relative overflow-hidden">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <Reveal>
                    <div className="relative rounded-3xl md:rounded-[2.5rem] bg-slate-900 p-8 md:p-16 overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.25),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.15),transparent_50%)]" />
                        <div className="absolute top-0 right-0 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />

                        <div className="relative text-center max-w-2xl mx-auto">
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
                                <svg className="w-4 h-4 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="text-xs font-bold text-white uppercase tracking-wide">14 jours d'essai, sans CB</span>
                            </div>

                            <h2 className="text-3xl md:text-5xl font-serif text-white mb-6 leading-tight">
                                Retrouvez le temps <br className="hidden md:block" />
                                <span className="italic text-primary-300">de faire ce qui compte.</span>
                            </h2>
                            <p className="text-slate-300 text-base md:text-lg mb-10 leading-relaxed">
                                Rejoignez les 2 000+ soignants qui ont repris la main sur leur temps administratif.
                                Installation en 2 minutes, sans engagement.
                            </p>

                            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                                <Button
                                    onClick={onRegister}
                                    className="px-8 py-4 text-lg rounded-full shadow-xl shadow-primary-900/40 hover:shadow-primary-900/60 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto bg-primary-600 text-white hover:bg-primary-500 border border-primary-400/30"
                                >
                                    Démarrer mon essai gratuit
                                    <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </Button>
                            </div>

                            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-slate-400 text-xs md:text-sm">
                                <span className="inline-flex items-center gap-2">
                                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                    Sans engagement
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                    Données hébergées en France
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                    Support en 2h
                                </span>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    )
}
