-- Add stripe_subscription_id column to profiles table
-- This column stores the Stripe subscription ID for tracking user subscriptions

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Add index for faster lookups when processing webhook events
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id
ON profiles(stripe_subscription_id);

-- Verify the column was added
COMMENT ON COLUMN profiles.stripe_subscription_id IS 'Stripe subscription ID for recurring payments';
