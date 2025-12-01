'use client'

import { useDashboard } from '@/components/dashboard/DashboardContext'
import { Settings } from '@/components/Settings'
import { useRouter } from 'next/navigation'

export default function ParameterPage() {
    const { profile, refreshProfile, setToast } = useDashboard()
    const router = useRouter()

    return (
        <Settings
            profile={profile}
            onUpdate={refreshProfile}
            onClose={() => router.push('/dashboard')}
            onShowToast={(message, type) => setToast({ message, type })}
            activeSection="general"
            onSectionChange={(section) => {
                if (section === 'subscription') router.push('/dashboard/subscription')
            }}
        />
    )
}
