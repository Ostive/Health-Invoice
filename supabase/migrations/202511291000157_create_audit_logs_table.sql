create table audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id text,
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index audit_logs_user_id_idx on audit_logs (user_id);
create index audit_logs_action_idx on audit_logs (action);
create index audit_logs_created_at_idx on audit_logs (created_at);

alter table audit_logs enable row level security;

-- Only allow inserts from service role or authenticated users (via API)
-- Users should generally NOT be able to read audit logs unless they are admins (not implemented yet)
-- So we might just enable RLS and have no policies for SELECT for now, effectively making it write-only for normal users via server-side logic (service role).
-- But wait, we are using the Supabase client in API routes which usually uses the user's JWT.
-- So we need an INSERT policy.

create policy "Users can insert their own audit logs"
  on audit_logs for insert
  with check (auth.uid() = user_id);

-- Optional: Policy for admins to view logs (future proofing, skipped for now or restricted)
