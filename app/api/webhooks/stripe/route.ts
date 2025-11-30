
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia' as any, // Force version to avoid TS error with mismatching types
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
    console.log('🔔 [WEBHOOK] Received webhook request')

    const body = await req.text()
    const signature = (await headers()).get('stripe-signature') as string

    let event: Stripe.Event

    try {
        if (!signature || !webhookSecret) {
            console.error('❌ [WEBHOOK] Missing signature or webhook secret');
            console.error('Signature present:', !!signature);
            console.error('Webhook secret configured:', !!webhookSecret);
            return new NextResponse('Webhook Error: Missing signature or secret', { status: 400 })
        }
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
        console.log('✅ [WEBHOOK] Signature verified successfully')
        console.log('📦 [WEBHOOK] Event type:', event.type)
    } catch (err: any) {
        console.error(`❌ [WEBHOOK] Signature verification failed: ${err.message}`)
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
    }

    let supabase;
    try {
        supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
    } catch (err: any) {
        console.error('Error creating Supabase client:', err)
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
            console.log(`⚠️ [WEBHOOK] Event ${event.id} already processed. Skipping.`)
            return new NextResponse(null, { status: 200 })
        }

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session

                // We passed the user ID as client_reference_id in the payment link
                const userId = session.client_reference_id
                const customerId = session.customer as string
                const subscriptionId = session.subscription as string

                console.log('💳 [checkout.session.completed] Processing payment')
                console.log('   User ID:', userId)
                console.log('   Customer ID:', customerId)
                console.log('   Subscription ID:', subscriptionId)

                if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
                    console.error('❌ CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing in .env')
                    console.error('Without this key, the webhook cannot update the database!')
                }

                if (userId) {
                    console.log(`🔄 Processing checkout for user ${userId}`)

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
                        console.error('❌ Error updating profile with Stripe details:', error)
                        console.error('   Error code:', error.code)
                        console.error('   Error message:', error.message)
                        // Fallback: try updating only is_pro and stripe_customer_id (in case stripe_subscription_id column is missing)
                        if (error.code === '42703' || error.code === 'PGRST204') { // Column missing errors
                            console.log('⚠️  Columns missing, retrying update with available columns...')
                            const { error: retryError } = await supabase
                                .from('profiles')
                                .update({
                                    is_pro: true,
                                    stripe_customer_id: customerId
                                })
                                .eq('id', userId)

                            if (retryError) {
                                console.error('❌ Failed to update with stripe_customer_id, trying is_pro only:', retryError)
                                // Final fallback: just is_pro
                                const { error: finalError } = await supabase
                                    .from('profiles')
                                    .update({ is_pro: true })
                                    .eq('id', userId)

                                if (finalError) {
                                    console.error('❌ Failed final fallback:', finalError)
                                } else {
                                    console.log(`✅ User ${userId} upgraded to PRO (is_pro only)`)
                                }
                            } else {
                                console.log(`✅ User ${userId} upgraded to PRO (is_pro + customer_id)`)
                            }
                        }
                    } else {
                        console.log(`✅ User ${userId} upgraded to PRO with full Stripe details`)
                    }
                }
                // If userId is missing, try to find user by email
                if (!userId && session.customer_details?.email) {
                    const email = session.customer_details.email;
                    console.log(`No client_reference_id found. Trying to find user by email: ${email}`);

                    const { data: profiles } = await supabase
                        .from('profiles')
                        .select('id')
                        .eq('email', email)
                        .single();

                    if (profiles) {
                        console.log(`Found user by email: ${profiles.id}`);
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
                            console.log(`User ${profiles.id} upgraded to PRO (found by email)`);
                        } else {
                            console.error('Error updating profile found by email:', error);
                        }
                    } else {
                        console.log(`No user found with email: ${email}`);
                    }
                }

                break
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription
                const customerId = subscription.customer as string
                const subscriptionId = subscription.id

                console.log(`[customer.subscription.updated] Customer: ${customerId}, Status: ${subscription.status}`)

                // Update subscription status based on Stripe status
                const isPro = ['active', 'trialing'].includes(subscription.status)

                const { error } = await supabase
                    .from('profiles')
                    .update({
                        is_pro: isPro,
                        stripe_subscription_id: subscriptionId,
                        cancel_at_period_end: subscription.cancel_at_period_end,
                        current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString()
                    })
                    .eq('stripe_customer_id', customerId)

                if (error) {
                    console.error('Failed to update subscription status:', error)
                } else {
                    console.log(`Subscription updated for customer ${customerId}: ${subscription.status} (is_pro: ${isPro})`)
                }
                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription
                const customerId = subscription.customer as string

                console.log(`[customer.subscription.deleted] Customer: ${customerId}`)

                // Downgrade to free plan
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        is_pro: false,
                        stripe_subscription_id: null
                    })
                    .eq('stripe_customer_id', customerId)

                if (error) {
                    console.error('Failed to downgrade user:', error)
                } else {
                    console.log(`User downgraded to free: ${customerId}`)
                }
                break
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice
                console.log(`[invoice.payment_succeeded] Invoice ${invoice.id} for customer ${invoice.customer}`)
                // You can send email notifications here or log successful payments
                break
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice
                console.warn(`[invoice.payment_failed] Invoice ${invoice.id} for customer ${invoice.customer}`)
                // You can send email notifications here or handle failed payments
                // Optionally downgrade user if payment repeatedly fails
                break
            }

            default:
                console.log(`Unhandled event type ${event.type}`)
        }

        // Record processed event
        await supabase
            .from('processed_events')
            .insert({ event_id: event.id })

    } catch (error: any) {
        console.error('❌ [WEBHOOK] Error processing webhook:', error)
        console.error('Error stack:', error.stack)
        return new NextResponse('Webhook handler failed', { status: 500 })
    }

    console.log('✅ [WEBHOOK] Successfully processed webhook')
    return new NextResponse(null, { status: 200 })
}
