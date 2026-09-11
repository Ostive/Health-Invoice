'use client'

import React, { useState } from 'react'
import { LandingPage } from '@/components/LandingPage'
import { Legal, LegalPageType } from '@/components/Legal'

export function LandingClient() {
  const [legalView, setLegalView] = useState<LegalPageType | null>(null)

  return (
    <>
      <LandingPage onOpenLegal={setLegalView} />

      {legalView && (
        <Legal
          type={legalView}
          onClose={() => setLegalView(null)}
        />
      )}
    </>
  )
}
