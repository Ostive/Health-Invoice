alter table invoices add column deleted_at timestamp with time zone;

create index invoices_deleted_at_idx on invoices (deleted_at);
