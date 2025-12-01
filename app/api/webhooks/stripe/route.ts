
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia' as any, // Force version to avoid TS error with mismatching types
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {


    const body = await req.text()
    const signature = (await headers()).get('stripe-signature') as string

    let event: Stripe.Event

    try {
        if (!signature || !webhookSecret) {

            return new NextResponse('Webhook Error: Missing signature or secret', { status: 400 })
        }
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    } catch (err: any) {

        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
    }

    let supabase;
    try {
        supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
    } catch (err: any) {

        return new NextResponse('Configuration Error', { status: 500 })
    }

    try {
        // Idempotency check
        const { data: existingEvent } = await supabase
            .from('processed_events')
            .select('event_id')
            .eq('event_id', event.id)
            .single()

        if (existingEvent) {

            return new NextResponse(null, { status: 200 })
        }

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session

                // We passed the user ID as client_reference_id in the payment link
                const userId = session.client_reference_id
                const customerId = session.customer as string
                const subscriptionId = session.subscription as string



                if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {

                }

                if (userId) {


                    // Try to update all fields first
                    const { error } = await supabase
                        .from('profiles')
                        .update({
                            is_pro: true,
                            stripe_customer_id: customerId,
                            stripe_subscription_id: subscriptionId
                        })
                        .eq('id', userId)

                    if (error) {

                        // Fallback: try updating only is_pro and stripe_customer_id (in case stripe_subscription_id column is missing)
                        if (error.code === '42703' || error.code === 'PGRST204') { // Column missing errors

                            const { error: retryError } = await supabase
                                .from('profiles')
                                .update({
                                    is_pro: true,
                                    stripe_customer_id: customerId
                                })
                                .eq('id', userId)

                            if (retryError) {

                                // Final fallback: just is_pro
                                const { error: finalError } = await supabase
                                    .from('profiles')
                                    .update({ is_pro: true })
                                    .eq('id', userId)

                                if (finalError) {

                                } else {

                                }
                            } else {

                            }
                        }
                    } else {

                    }
                }
                // If userId is missing, try to find user by email
                if (!userId && session.customer_details?.email) {
                    const email = session.customer_details.email;


                    const { data: profiles } = await supabase
                        .from('profiles')
                        .select('id')
                        .eq('email', email)
                        .single();

                    if (profiles) {

                        // Update using the found ID
                        const { error } = await supabase
                            .from('profiles')
                            .update({
                                is_pro: true,
                                stripe_customer_id: customerId,
                                stripe_subscription_id: subscriptionId
                            })
                            .eq('id', profiles.id);

                        if (!error) {

                        } else {

                        }
                    } else {

                    }
                }

                break
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription
                const customerId = subscription.customer as string
                const subscriptionId = subscription.id

                // Update subscription status based on Stripe status
                const isPro = ['active', 'trialing'].includes(subscription.status)

                // Safely handle date conversion
                let currentPeriodEnd;
                try {
                    const periodEnd = (subscription as any).current_period_end;
                    if (periodEnd) {
                        currentPeriodEnd = new Date(periodEnd * 1000).toISOString();
                    }
                } catch (e) {
                    console.error('Error parsing date:', e);
                }

                const { error } = await supabase
                    .from('profiles')
                    .update({
                        is_pro: isPro,
                        stripe_subscription_id: subscriptionId,
                        cancel_at_period_end: subscription.cancel_at_period_end,
                        current_period_end: currentPeriodEnd
                    })
                    .eq('stripe_customer_id', customerId)

                if (error) {
                    console.error('Supabase update error:', error);
                }
                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription
                const customerId = subscription.customer as string

                // Downgrade to free plan
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        is_pro: false,
                        stripe_subscription_id: null,
                        cancel_at_period_end: false
                    })
                    .eq('stripe_customer_id', customerId)

                if (error) {
                    console.error('Supabase update error (deleted):', error);
                }
                break
            }

            case 'invoice.payment_succeeded': {
                // const invoice = event.data.object as Stripe.Invoice
                // You can send email notifications here or log successful payments
                break
            }

            case 'invoice.payment_failed': {
                // const invoice = event.data.object as Stripe.Invoice
                // You can send email notifications here or handle failed payments
                break
            }

            default:
            // Unhandled event type
        }

        // Record processed event
        await supabase
            .from('processed_events')
            .insert({ event_id: event.id })

    } catch (error: any) {
        console.error('Webhook handler failed:', error);
        return new NextResponse(`Webhook handler failed: ${error.message}`, { status: 500 })
    }


    return new NextResponse(null, { status: 200 })
}
