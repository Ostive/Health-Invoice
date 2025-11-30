import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia' as any,
})

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = user.id
        const userEmail = user.email

        // Get the price ID from environment (you need to add this)
        const priceId = process.env.STRIPE_PRICE_ID || 'price_1SXoToHwsA26qdYQcXtL5MLY' // Use your actual price ID

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?canceled=true`,
            client_reference_id: userId, // THIS is how you pass the user ID!
            customer_email: userEmail,
            metadata: {
                userId: userId, // Also add to metadata as backup
            },
            allow_promotion_codes: true,
        })

        return NextResponse.json({ sessionId: session.id, url: session.url })
    } catch (error: any) {
        console.error('Error creating checkout session:', error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
