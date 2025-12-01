import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia' as any,
});

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return new NextResponse('User ID is required', { status: 400 });
        }

        // 1. Get user profile to get stripe_subscription_id
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: profile } = await supabase
            .from('profiles')
            .select('stripe_subscription_id')
            .eq('id', userId)
            .single();

        if (!profile?.stripe_subscription_id) {
            return new NextResponse('No active subscription found', { status: 404 });
        }

        // 2. Reactivate subscription in Stripe
        const subscription = await stripe.subscriptions.update(
            profile.stripe_subscription_id,
            { cancel_at_period_end: false }
        );

        // 3. Update Supabase
        await supabase
            .from('profiles')
            .update({
                cancel_at_period_end: false,
                current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString()
            })
            .eq('id', userId);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Error reactivating subscription:', error);
        return new NextResponse(error.message, { status: 500 });
    }
}
