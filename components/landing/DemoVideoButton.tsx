'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { buttonClass } from '@/components/ui/button-styles'
import { Modal } from '@/components/ui/modal'

export function DemoVideoButton() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <Button size="lg" variant="ghost" onClick={() => setIsOpen(true)}>
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M10 9.5v5l4-2.5-4-2.5z" /></svg>
                Voir la démo
            </Button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Démonstration vidéo" className="max-w-md">
                <p className="text-sm leading-relaxed text-ink-soft">
                    La vidéo de présentation arrive bientôt. En attendant, l’Offre Découverte vous permet de dicter vos premières factures gratuitement.
                </p>
                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Fermer</Button>
                    <Link href="/inscription" className={buttonClass()}>Essayer gratuitement</Link>
                </div>
            </Modal>
        </>
    )
}
