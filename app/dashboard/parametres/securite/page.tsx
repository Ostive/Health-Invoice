import type { Metadata } from 'next'
import { SecuritySettings } from '@/components/settings/SecuritySettings'

export const metadata: Metadata = { title: 'Sécurité et données' }

export default function SecuritySettingsPage() {
    return <SecuritySettings />
}
