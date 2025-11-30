create table processed_events (
  id uuid default gen_random_uuid() primary key,
  event_id text not null unique,
  processed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index processed_events_event_id_idx on processed_events (event_id);
