import type { Metadata } from 'next'
import { InvoiceWorkspace } from '@/components/dashboard/InvoiceWorkspace'

export const metadata: Metadata = { title: 'Facture' }

// The editor context reads the invoice id from this URL: an invoice can be bookmarked,
// reloaded and reached with back/forward
export default function InvoicePage() {
    return <InvoiceWorkspace />
}
