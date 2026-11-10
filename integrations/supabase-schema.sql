-- Supabase Free-Tier Setup for Summit Roofing Prototype
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text not null,
  address text not null,
  roof_type text not null,
  service text not null,
  message text default '',
  created_at timestamptz not null default now(),
  status text not null default 'New'
);

alter table public.leads enable row level security;

-- Prototype policies (allow anonymous insert from estimate form and select for /leads.html demo)
create policy "Allow public insert on leads" on public.leads
  for insert to anon with check (true);

create policy "Allow public select on leads for prototype demo" on public.leads
  for select to anon using (true);
