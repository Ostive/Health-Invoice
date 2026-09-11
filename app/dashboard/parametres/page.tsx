import type { Metadata } from 'next'
import { ProfileSettings } from '@/components/settings/ProfileSettings'

export const metadata: Metadata = { title: 'Paramètres' }

export default function ProfileSettingsPage() {
    return <ProfileSettings />
}
