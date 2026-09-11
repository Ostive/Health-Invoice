

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

export const reactivateSubscription = async (userId: string) => {
    try {
        const response = await fetch('/api/stripe/reactivate-subscription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || 'Failed to reactivate subscription');
        }

        return true;
    } catch (error: any) {
        console.error('Error reactivating subscription:', error);
        throw error;
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

// Demo mode: the free-plan invoice quota only applies when NEXT_PUBLIC_ENFORCE_PLAN_LIMITS=true
export const PLAN_LIMITS_ENFORCED = process.env.NEXT_PUBLIC_ENFORCE_PLAN_LIMITS === 'true';
