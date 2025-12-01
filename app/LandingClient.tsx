'use client'

import React, { useState } from 'react'
import { LandingPage } from '@/components/LandingPage'
import { Auth, AuthMode } from '@/components/Auth'
import { Legal, LegalPageType } from '@/components/Legal'

export function LandingClient() {
  const [authMode, setAuthMode] = useState<AuthMode | null>(null)
  const [legalView, setLegalView] = useState<LegalPageType | null>(null)

  const handleOpenLegal = (type: LegalPageType) => {
    setLegalView(type)
  }

  return (
    <>
      <LandingPage
        onLogin={() => setAuthMode('login')}
        onRegister={() => setAuthMode('register')}
        onOpenLegal={handleOpenLegal}
      />

      {authMode && (
        <Auth
          initialMode={authMode}
          onClose={() => setAuthMode(null)}
        />
      )}

      {legalView && (
        <Legal
          type={legalView}
          onClose={() => setLegalView(null)}
        />
      )}
    </>
  )
}
