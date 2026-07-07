-- =========================================================
-- AgentIA — Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- =========================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------
-- USERS (extends Supabase's built-in auth.users)
-- ---------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text check (role in ('admin','user')) not null default 'user',
  phone text,
  profile_picture_url text,
  agency_name text,
  default_commission text,
  subscription_plan text check (subscription_plan in ('Starter','Professional','Enterprise')),
  subscription_status text check (subscription_status in ('active','inactive')) default 'inactive',
  subscription_end_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------
-- LEADS
-- ---------------------------------------------------------
create table if not exists public.leads (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users(id) default auth.uid(),
  name text not null,
  phone text,
  email text,
  lead_source text check (lead_source in ('Facebook','Referral','Walk-in','Website','Other')),
  budget_min numeric,
  budget_max numeric,
  property_interest text check (property_interest in ('Buy','Sell','Rent')),
  preferred_location text,
  status text check (status in ('New','Contacted','Site Visit Scheduled','Negotiation','Closed','Lost')) default 'New',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------
-- PROPERTIES
-- ---------------------------------------------------------
create table if not exists public.properties (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users(id) default auth.uid(),
  title text not null,
  type text check (type in ('House','Apartment','Plot','Commercial')) not null,
  price numeric not null,
  location text not null,
  size text,
  bedrooms numeric,
  bathrooms numeric,
  description text,
  images text[] default '{}',
  status text check (status in ('Available','Under Negotiation','Sold','Rented')) default 'Available',
  interested_leads uuid[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------
-- DEALS
-- ---------------------------------------------------------
create table if not exists public.deals (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users(id) default auth.uid(),
  lead_id uuid references public.leads(id) on delete set null,
  lead_name text not null,
  property_id uuid references public.properties(id) on delete set null,
  property_title text,
  deal_value numeric not null,
  commission_percentage numeric,
  commission_amount numeric,
  stage text check (stage in ('New Lead','Site Visit','Negotiation','Agreement','Closed')) default 'New Lead',
  expected_closing_date date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------
-- INVOICES
-- ---------------------------------------------------------
create table if not exists public.invoices (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users(id) default auth.uid(),
  invoice_number text not null,
  lead_id uuid references public.leads(id) on delete set null,
  lead_name text not null,
  property_reference text,
  amount numeric not null,
  description text,
  due_date date,
  status text check (status in ('Paid','Pending','Overdue')) not null default 'Pending',
  payment_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------
-- FOLLOW-UPS
-- ---------------------------------------------------------
create table if not exists public.follow_ups (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users(id) default auth.uid(),
  lead_id uuid references public.leads(id) on delete cascade not null,
  lead_name text not null,
  date date not null,
  time text,
  note text,
  completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------
-- DOCUMENTS
-- ---------------------------------------------------------
create table if not exists public.documents (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users(id) default auth.uid(),
  name text not null,
  file_url text not null,
  lead_id uuid references public.leads(id) on delete set null,
  lead_name text,
  deal_id uuid references public.deals(id) on delete set null,
  category text check (category in ('ID Copy','Agreement','Token Receipt','Advance Receipt','Other')) default 'Other',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------
-- COMMUNICATION LOGS
-- ---------------------------------------------------------
create table if not exists public.communication_logs (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users(id) default auth.uid(),
  lead_id uuid references public.leads(id) on delete cascade not null,
  type text check (type in ('Call','WhatsApp','Email','Meeting','Note')) not null,
  content text not null,
  date date default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================================================
-- ROW LEVEL SECURITY — each user only sees their own data
-- =========================================================
alter table public.users enable row level security;
alter table public.leads enable row level security;
alter table public.properties enable row level security;
alter table public.deals enable row level security;
alter table public.invoices enable row level security;
alter table public.follow_ups enable row level security;
alter table public.documents enable row level security;
alter table public.communication_logs enable row level security;

-- Users: can read/update only their own row
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

-- Generic owner-based policy for the rest (repeat pattern per table)
create policy "Owner full access - leads" on public.leads
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "Owner full access - properties" on public.properties
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "Owner full access - deals" on public.deals
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "Owner full access - invoices" on public.invoices
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "Owner full access - follow_ups" on public.follow_ups
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "Owner full access - documents" on public.documents
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "Owner full access - communication_logs" on public.communication_logs
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- =========================================================
-- Auto-create a `public.users` row whenever someone signs up
-- =========================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================
-- STORAGE POLICIES — for the "documents" bucket
-- Public reads are fine (that's the whole point of a public bucket);
-- these policies control who can upload/delete.
-- =========================================================
create policy "Authenticated users can upload documents"
  on storage.objects for insert
  with check (bucket_id = 'documents' and auth.role() = 'authenticated');

create policy "Authenticated users can delete their own documents"
  on storage.objects for delete
  using (bucket_id = 'documents' and auth.role() = 'authenticated');
