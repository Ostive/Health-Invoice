import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { handleApiError, unauthorized, notFound } from '@/lib/api-errors'

const ROUTE = 'api/stripe/create-portal-session'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia' as any,
})

export async function POST() {
    let userId: string | undefined

    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) throw unauthorized()
        userId = user.id

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single()

        if (error || !profile?.stripe_customer_id) throw notFound('No active subscription found')

        const session = await stripe.billingPortal.sessions.create({
            customer: profile.stripe_customer_id,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/parametres/abonnement`,
        })

        return NextResponse.json({ url: session.url })
    } catch (error) {
        return handleApiError(error, { route: ROUTE, userId })
    }
}
