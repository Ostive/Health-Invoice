import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { LandingClient } from './LandingClient'

export default async function Home() {
  // Use getUser() for security - it validates the session with Supabase
  const { user } = await getUser()

  // If user is authenticated, redirect to dashboard
  // The middleware will also handle this, but this provides a faster redirect
  if (user) {
    redirect('/dashboard')
  }

  return <LandingClient />
}
