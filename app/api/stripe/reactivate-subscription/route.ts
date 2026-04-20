import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { handleApiError, unauthorized, notFound } from '@/lib/api-errors'

const ROUTE = 'api/stripe/reactivate-subscription'

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

        const { data: profile } = await supabase
            .from('profiles')
            .select('stripe_subscription_id')
            .eq('id', user.id)
            .single()

        if (!profile?.stripe_subscription_id) throw notFound('No active subscription found')

        const subscription = await stripe.subscriptions.update(
            profile.stripe_subscription_id,
            { cancel_at_period_end: false }
        )

        const currentPeriodEnd = (subscription as any).current_period_end
        const admin = createAdminClient()
        await admin
            .from('profiles')
            .update({
                cancel_at_period_end: false,
                current_period_end: currentPeriodEnd
                    ? new Date(currentPeriodEnd * 1000).toISOString()
                    : null,
            })
            .eq('id', user.id)

        return NextResponse.json({ success: true })
    } catch (error) {
        return handleApiError(error, { route: ROUTE, userId })
    }
}
