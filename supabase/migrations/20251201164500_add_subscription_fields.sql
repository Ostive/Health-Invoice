-- Add subscription status fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;

-- Add comment
COMMENT ON COLUMN public.profiles.cancel_at_period_end IS 'Whether the subscription is set to cancel at the end of the period';
COMMENT ON COLUMN public.profiles.current_period_end IS 'End date of the current subscription period';
