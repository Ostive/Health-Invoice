'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function DebugPage() {
    const [profile, setProfile] = useState<any>(null)
    const [error, setError] = useState<any>(null)
    const supabase = createClient()

    useEffect(() => {
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
            <h1 className="text-2xl font-bold mb-4">Debug Profile</h1>
            {error && <pre className="text-red-500">{JSON.stringify(error, null, 2)}</pre>}
            {profile && (
                <pre className="bg-slate-100 p-4 rounded">
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
