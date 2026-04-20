'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useInView } from './useInView'

interface StatProps {
    value: number
    suffix?: string
    prefix?: string
    label: string
    duration?: number
    decimals?: number
}

const StatItem: React.FC<StatProps> = ({ value, suffix = '', prefix = '', label, duration = 1800, decimals = 0 }) => {
    const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.4 })
    const [display, setDisplay] = useState(0)
    const started = useRef(false)

    useEffect(() => {
        if (!inView || started.current) return
        started.current = true
        const startTime = performance.now()
        let rafId = 0
        const tick = (now: number) => {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setDisplay(value * eased)
            if (progress < 1) rafId = requestAnimationFrame(tick)
            else setDisplay(value)
        }
        rafId = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(rafId)
    }, [inView, value, duration])

    const formatted = decimals > 0
        ? display.toFixed(decimals).replace('.', ',')
        : Math.round(display).toLocaleString('fr-FR')

    return (
        <div ref={ref} className="text-center">
            <div className="text-4xl md:text-6xl font-serif font-medium text-white mb-2 tracking-tight">
                {prefix}{formatted}{suffix}
            </div>
            <p className="text-primary-100/80 text-sm md:text-base font-light">{label}</p>
        </div>
    )
}

export const Stats: React.FC = () => {
    return (
        <section className="py-16 md:py-24 relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.06),transparent_50%)]" />

            <div className="absolute top-10 left-10 w-32 h-32 border border-white/10 rounded-full" />
            <div className="absolute bottom-10 right-10 w-48 h-48 border border-white/10 rounded-full" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
                    <span className="inline-block text-xs font-bold text-primary-200 uppercase tracking-widest mb-3">En chiffres</span>
                    <h2 className="text-3xl md:text-4xl font-serif text-white leading-tight">
                        Une tranquillité d'esprit <br className="hidden md:block" />que vos confrères <span className="italic">plébiscitent.</span>
                    </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
                    <StatItem value={2000} suffix="+" label="Soignants nous font confiance" />
                    <StatItem value={5} suffix=" min" label="Économisées par facture" />
                    <StatItem value={99.9} suffix="%" label="De disponibilité service" decimals={1} />
                    <StatItem value={4.9} suffix="/5" label="Note moyenne utilisateurs" decimals={1} />
                </div>
            </div>
        </section>
    )
}
