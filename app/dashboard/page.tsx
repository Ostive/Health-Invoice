import type { Metadata } from 'next'
import { InvoiceWorkspace } from '@/components/dashboard/InvoiceWorkspace'

export const metadata: Metadata = { title: 'Factures' }

export default function InvoicesPage() {
  return <InvoiceWorkspace />
}
