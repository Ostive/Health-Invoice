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

const StatItem: React.FC<StatProps> = ({ value, suffix = '', prefix = '', label, duration = 1600, decimals = 0 }) => {
    const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.4 })
    const [display, setDisplay] = useState(0)
    const started = useRef(false)

    useEffect(() => {
        if (!inView || started.current) return
        started.current = true
        // Reduced motion: jump straight to the final value on the first frame
        const effectiveDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : duration
        const startTime = performance.now()
        let rafId = 0
        const tick = (now: number) => {
            const progress = effectiveDuration === 0 ? 1 : Math.min((now - startTime) / effectiveDuration, 1)
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
        <div ref={ref} className="px-2 py-8 md:px-8 md:py-2">
            <div className="font-display text-4xl font-semibold tabular text-ink md:text-5xl">
                {prefix}{formatted}<span className="text-primary-600">{suffix}</span>
            </div>
            <p className="mt-2 text-sm text-ink-soft">{label}</p>
        </div>
    )
}

export const Stats: React.FC = () => {
    return (
        <section aria-label="En chiffres" className="border-y border-rule bg-white py-10 md:py-16">
            <div className="mx-auto grid max-w-6xl grid-cols-2 divide-rule px-4 sm:px-6 md:grid-cols-4 md:divide-x [&>*:nth-child(-n+2)]:border-b [&>*:nth-child(-n+2)]:border-rule md:[&>*:nth-child(-n+2)]:border-b-0">
                <StatItem value={2000} suffix="+" label="soignants utilisent l’outil" />
                <StatItem value={5} suffix=" min" label="gagnées par facture" />
                <StatItem value={99.9} suffix=" %" label="de disponibilité du service" decimals={1} />
                <StatItem value={4.9} suffix="/5" label="de note moyenne" decimals={1} />
            </div>
        </section>
    )
}
