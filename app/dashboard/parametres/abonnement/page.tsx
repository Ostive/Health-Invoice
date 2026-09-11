import type { Metadata } from 'next'
import { SubscriptionSettings } from '@/components/settings/SubscriptionSettings'

export const metadata: Metadata = { title: 'Abonnement' }

export default function SubscriptionSettingsPage() {
    return <SubscriptionSettings />
}
