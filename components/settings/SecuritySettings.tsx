'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Field, Input } from '@/components/ui/input'
import { useDashboard } from '@/components/dashboard/DashboardContext'
import { errorMessage } from '@/lib/errors'
import { SettingsHeading } from './SettingsCard'

const CONFIRMATION_WORD = 'supprimer'

export function SecuritySettings() {
    const { setToast } = useDashboard()
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [confirmation, setConfirmation] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDeleteAccount = async () => {
        if (confirmation !== CONFIRMATION_WORD) return

        setIsDeleting(true)
        try {
            const response = await fetch('/api/delete-account', { method: 'DELETE' })
            if (!response.ok) throw new Error('Erreur lors de la suppression du compte')
            setToast({ message: 'Compte supprimé', type: 'success' })
            // Full reload: the session and every cached dashboard state must go
            window.location.assign('/')
        } catch (err) {
            setToast({ message: "Le compte n'a pas pu être supprimé : " + errorMessage(err), type: 'error' })
            setIsDeleting(false)
        }
    }

    return (
        <div className="space-y-6">
            <SettingsHeading title="Sécurité et données" description="Gérez vos données personnelles et votre compte." />

            <section className="rounded-2xl border border-red-200 bg-white">
                <div className="border-b border-red-100 px-5 py-4 sm:px-6">
                    <h3 className="font-display text-[15px] font-semibold text-red-800">Supprimer le compte</h3>
                </div>
                <div className="flex flex-col gap-4 p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
                    <p className="max-w-md text-sm leading-relaxed text-ink-soft">
                        Vos factures, patients et paramètres seront définitivement effacés, conformément au RGPD. Téléchargez les PDF dont vous avez besoin avant de continuer.
                    </p>
                    <Button
                        variant="outline"
                        className="shrink-0 border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50"
                        onClick={() => {
                            setConfirmation('')
                            setIsDeleteModalOpen(true)
                        }}
                    >
                        Supprimer mon compte
                    </Button>
                </div>
            </section>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Supprimer définitivement votre compte ?"
                className="max-w-md"
            >
                <p className="text-sm leading-relaxed text-ink-soft">
                    Toutes vos factures et données patients seront effacées. Il ne sera pas possible de les récupérer.
                </p>
                <Field label={<>Tapez <strong className="font-semibold text-ink">{CONFIRMATION_WORD}</strong> pour confirmer</>} htmlFor="delete-confirmation" className="mt-5">
                    <Input
                        id="delete-confirmation"
                        type="text"
                        placeholder={CONFIRMATION_WORD}
                        value={confirmation}
                        onChange={(e) => setConfirmation(e.target.value)}
                        autoComplete="off"
                        className="focus:border-red-600 focus:ring-red-600/12"
                    />
                </Field>
                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Annuler</Button>
                    <Button variant="danger" disabled={confirmation !== CONFIRMATION_WORD || isDeleting} isLoading={isDeleting} onClick={handleDeleteAccount}>
                        Supprimer mon compte
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
