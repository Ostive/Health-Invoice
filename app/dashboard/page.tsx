'use client'

import { useDashboard } from '@/components/dashboard/DashboardContext'
import { InvoiceWorkspace } from '@/components/dashboard/InvoiceWorkspace'
import { PatientsView } from '@/components/dashboard/PatientsView'

export default function DashboardPage() {
  const { currentView } = useDashboard();

  if (currentView === 'patients') {
    return <PatientsView />
  }

  return <InvoiceWorkspace />
}
