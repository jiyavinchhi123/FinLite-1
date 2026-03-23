-- Supabase PostgreSQL schema for Smart Business Finance Manager

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password text not null,
  created_at timestamptz default now()
);

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references users(id) on delete set null,
  name text not null,
  business_type text,
  opening_cash numeric(12,2) default 0,
  opening_bank numeric(12,2) default 0,
  owner_capital numeric(12,2) default 0,
  fiscal_start date,
  created_at timestamptz default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  name text not null,
  mobile text,
  email text,
  address text,
  opening_balance numeric(12,2) default 0,
  created_at timestamptz default now()
);

create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  name text not null,
  contact text,
  opening_payable numeric(12,2) default 0,
  created_at timestamptz default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  type text not null, -- income or expense
  amount numeric(12,2) not null,
  date date,
  payment_mode text,
  category text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists income (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  amount numeric(12,2) not null,
  date date,
  payment_mode text,
  category text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists expense (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  supplier_id uuid references suppliers(id) on delete set null,
  amount numeric(12,2) not null,
  date date,
  payment_mode text,
  category text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists pending_payments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  supplier_id uuid references suppliers(id) on delete set null,
  amount numeric(12,2) not null,
  date date,
  payment_mode text,
  category text,
  notes text,
  created_at timestamptz default now()
);
