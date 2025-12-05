-- Create composite index for rate limiting performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_rate_limit 
ON public.audit_logs (user_id, action, created_at);
