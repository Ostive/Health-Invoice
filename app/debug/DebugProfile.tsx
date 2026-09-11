'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

type ProfileRow = Record<string, unknown> & { invoice_counter?: number; last_invoice_year?: number }

export function DebugProfile() {
    const [profile, setProfile] = useState<ProfileRow | null>(null)
    const [error, setError] = useState<unknown>(null)

    useEffect(() => {
        const supabase = createClient()
        async function load() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setError('No user logged in')
                return
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            setProfile(data)
            if (error) setError(error)
        }
        load()
    }, [])

    return (
        <div className="p-8">
            <h1 className="mb-4 text-2xl font-bold">Debug Profile</h1>
            {error ? <pre className="text-red-600">{JSON.stringify(error, null, 2)}</pre> : null}
            {profile && (
                <pre className="rounded-sm bg-paper p-4">
                    {JSON.stringify(profile, null, 2)}
                </pre>
            )}
            <div className="mt-4">
                <h2 className="font-bold">Migration Check:</h2>
                <p>invoice_counter: {profile?.invoice_counter !== undefined ? profile.invoice_counter : 'MISSING'}</p>
                <p>last_invoice_year: {profile?.last_invoice_year !== undefined ? profile.last_invoice_year : 'MISSING'}</p>
            </div>
        </div>
    )
}
