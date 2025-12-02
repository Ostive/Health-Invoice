'use client'

import { useDashboard } from '@/components/dashboard/DashboardContext'
import { Settings } from '@/components/Settings'
import { useRouter } from 'next/navigation'

export default function SubscriptionPage() {
    const { profile, refreshProfile, setToast } = useDashboard()
    const router = useRouter()

    return (
        <Settings
            profile={profile}
            onUpdate={refreshProfile}
            onClose={() => router.push('/dashboard')}
            onShowToast={(message, type) => setToast({ message, type })}
            activeSection="subscription"
            onSectionChange={(section) => {
                if (section === 'general') router.push('/dashboard/parameter')
                if (section === 'security') router.push('/dashboard/security')
            }}
        />
    )
}
