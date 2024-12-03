-- Create users table
create table if not exists public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null unique,
  name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create shifts table
create table if not exists public.shifts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create non_accounting_days table
create table if not exists public.non_accounting_days (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  date date not null,
  reason text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

-- Create subscriptions table
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  stripe_subscription_id text unique,
  stripe_customer_id text unique,
  status text not null,
  plan_id text not null,
  current_period_start timestamp with time zone not null,
  current_period_end timestamp with time zone not null,
  trial_end timestamp with time zone,
  cancel_at timestamp with time zone,
  canceled_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies
alter table public.users enable row level security;
alter table public.shifts enable row level security;
alter table public.non_accounting_days enable row level security;
alter table public.subscriptions enable row level security;

-- Users policies
create policy "Users can view own profile" 
  on public.users for select 
  using (auth.uid() = id);

create policy "Users can update own profile" 
  on public.users for update 
  using (auth.uid() = id);

-- Shifts policies
create policy "Users can view own shifts" 
  on public.shifts for select 
  using (auth.uid() = user_id);

create policy "Users can insert own shifts" 
  on public.shifts for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own shifts" 
  on public.shifts for update 
  using (auth.uid() = user_id);

create policy "Users can delete own shifts" 
  on public.shifts for delete 
  using (auth.uid() = user_id);

-- Non accounting days policies
create policy "Users can view own non accounting days" 
  on public.non_accounting_days for select 
  using (auth.uid() = user_id);

create policy "Users can insert own non accounting days" 
  on public.non_accounting_days for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own non accounting days" 
  on public.non_accounting_days for update 
  using (auth.uid() = user_id);

create policy "Users can delete own non accounting days" 
  on public.non_accounting_days for delete 
  using (auth.uid() = user_id);

-- Subscriptions policies
create policy "Users can view own subscription" 
  on public.subscriptions for select 
  using (auth.uid() = user_id);

-- Functions and triggers
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
