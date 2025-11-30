
import { supabase } from './supabase';

// Load from environment variables
export const STRIPE_PAYMENT_LINK = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK || 'https://buy.stripe.com/test_';
export const STRIPE_PORTAL_LINK = process.env.NEXT_PUBLIC_STRIPE_PORTAL_LINK || 'https://billing.stripe.com/p/login';
export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
export const STRIPE_PRODUCT_ID = process.env.NEXT_PUBLIC_STRIPE_PRODUCT_ID || '';

export const subscribeToPro = async (userId: string, userEmail?: string) => {
    try {
        // Call our API to create a Checkout Session
        const response = await fetch('/api/stripe/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to create checkout session');
        }

        // Redirect to Stripe Checkout
        window.location.href = data.url;
    } catch (error: any) {
        console.error('Error creating checkout session:', error);
        alert(`Erreur lors de la création de la session de paiement: ${error.message}`);
    }
};

export const manageSubscription = async (userId: string) => {
    try {
        // Call API to create a portal session
        const response = await fetch('/api/stripe/create-portal-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to create portal session');
        }

        // Redirect to Stripe Customer Portal
        window.location.href = data.url;
    } catch (error: any) {
        console.error('Error opening customer portal:', error);
        alert(`Impossible d'ouvrir le portail: ${error.message}`);
    }
};

export const PLAN_LIMITS = {
    free: {
        maxInvoices: 3,
        aiGenerations: 5
    },
    pro: {
        maxInvoices: Infinity,
        aiGenerations: Infinity
    }
};
