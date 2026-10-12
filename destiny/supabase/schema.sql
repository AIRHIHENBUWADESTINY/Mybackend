-- Expenses table for the Destiny Expense Manager dashboard.
-- Run this in the Supabase SQL editor (Dashboard > SQL Editor > New query).

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  description text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  category text not null default 'Other',
  expense_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index expenses_user_date_idx
  on public.expenses (user_id, expense_date desc);

alter table public.expenses enable row level security;

create policy "Users can view own expenses"
  on public.expenses for select
  using (auth.uid() = user_id);

create policy "Users can insert own expenses"
  on public.expenses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own expenses"
  on public.expenses for update
  using (auth.uid() = user_id);

create policy "Users can delete own expenses"
  on public.expenses for delete
  using (auth.uid() = user_id);

-- Accounts a user has created for other people.
-- auth.users is not readable by clients, so this table records who owns
-- which login. Rows are inserted and removed by the delete-account /
-- create-account edge functions using the service role key.
create table public.managed_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  user_id uuid not null unique references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create index managed_accounts_owner_idx
  on public.managed_accounts (owner_id, created_at desc);

alter table public.managed_accounts enable row level security;

create policy "Users can view own managed accounts"
  on public.managed_accounts for select
  using (auth.uid() = owner_id);

create policy "Users can delete own managed accounts"
  on public.managed_accounts for delete
  using (auth.uid() = owner_id);

-- No insert policy on purpose: only the service role may claim ownership of
-- a newly created login. Clients must not be able to forge these rows.