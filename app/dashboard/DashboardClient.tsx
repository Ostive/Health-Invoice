'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Legal, LegalPageType } from '@/components/Legal'
import { createClient } from '@/lib/supabase/client'
import { UserProfile } from '@/types/index'
import { useRouter, usePathname } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

import { DashboardSkeleton } from '@/components/DashboardSkeleton'

// Dynamically import Dashboard with no SSR to avoid html2pdf.js issues
const Dashboard = dynamic(() => import('@/components/Dashboard').then(mod => ({ default: mod.Dashboard })), {
  ssr: false,
  loading: () => <DashboardSkeleton />
})

interface DashboardClientProps {
  initialUser: User
  initialView?: string
  children?: React.ReactNode
}

export function DashboardClient({ initialUser, initialView, children }: DashboardClientProps) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [legalView, setLegalView] = useState<LegalPageType | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = React.useMemo(() => createClient(), [])

  // Determine view based on pathname
  const showSettings = pathname?.includes('/parameter') || pathname?.includes('/subscription')
  const settingsSection = pathname?.includes('/subscription') ? 'subscription' : 'general'

  useEffect(() => {
    // Fetch profile on mount
    if (initialUser) {
      fetchProfile(initialUser)
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!newSession) {
        router.push('/')
      } else {
        setUser(newSession.user)
        await fetchProfile(newSession.user)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [initialUser, router, supabase])

  const fetchProfile = async (user: any) => {
    try {
      // Use API route to bypass potential client-side RLS issues
      const response = await fetch('/api/profile');
      const data = await response.json();

      console.log('DashboardClient: fetchProfile API result', data);

      const defaults = {
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        email: user.email || ''
      }

      if (!data || data.error) {
        console.log('DashboardClient: Profile not found or error, creating fallback with defaults', defaults);
        const fallbackProfile: UserProfile = {
          id: user.id,
          email: defaults.email,
          full_name: defaults.full_name,
          is_pro: false
        }
        setUserProfile(fallbackProfile)
        return
      }

      if (data) {
        // Merge with defaults if fields are missing in DB
        const mergedProfile = {
          ...data,
          full_name: data.full_name || defaults.full_name,
          email: data.email || defaults.email
        }
        setUserProfile(mergedProfile as UserProfile)
      }
    } catch (err) {
      console.error("Error fetching profile:", err)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })

      // Clear localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') && key.includes('-auth-token')) {
          localStorage.removeItem(key)
        }
      })

      sessionStorage.clear()
      window.location.href = '/'
    } catch (err) {
      console.error("Logout failed:", err)
      window.location.href = '/'
    }
  }

  const handleOpenLegal = (type: LegalPageType) => {
    setLegalView(type)
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Dashboard
        user={user}
        profile={userProfile}
        onProfileUpdate={() => user && fetchProfile(user)}
        onLogout={handleLogout}
        onOpenLegal={handleOpenLegal}
        showSettings={showSettings}
        settingsSection={settingsSection}
      />

      {/* Render children (pages) hidden to keep router active but not show content */}
      <div className="hidden">{children}</div>

      {legalView && (
        <Legal
          type={legalView}
          onClose={() => setLegalView(null)}
        />
      )}
    </>
  )
}
