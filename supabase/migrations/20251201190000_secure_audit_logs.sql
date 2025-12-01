-- Revoke insert permission for authenticated users on audit_logs
DROP POLICY IF EXISTS "Users can insert their own audit logs" ON public.audit_logs;

-- Create a policy that allows NO ONE to insert via the client API
-- (Service role bypasses RLS, so server-side code will still work)
CREATE POLICY "Deny all inserts from client"
    ON public.audit_logs
    FOR INSERT
    WITH CHECK (false);

-- Ensure RLS is enabled
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
