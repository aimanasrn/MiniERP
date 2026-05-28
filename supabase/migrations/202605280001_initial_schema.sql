create extension if not exists pgcrypto;

create type public.membership_role as enum (
  'super_admin',
  'company_admin',
  'hr_manager',
  'finance_manager',
  'inventory_manager',
  'sales_staff',
  'employee'
);

create type public.membership_status as enum (
  'invited',
  'active',
  'suspended'
);

create type public.company_status as enum (
  'draft',
  'active',
  'archived'
);

create type public.profile_status as enum (
  'pending',
  'active',
  'disabled'
);

create type public.employee_status as enum (
  'active',
  'inactive',
  'terminated'
);

create type public.product_status as enum (
  'active',
  'inactive',
  'archived'
);

create type public.customer_status as enum (
  'active',
  'inactive',
  'archived'
);

create type public.invoice_status as enum (
  'draft',
  'sent',
  'paid',
  'overdue',
  'void'
);

create type public.expense_status as enum (
  'draft',
  'submitted',
  'approved',
  'rejected',
  'paid'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  status public.profile_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  industry text,
  country text,
  currency_code text,
  timezone text,
  status public.company_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  constraint companies_currency_code_length check (
    currency_code is null or char_length(currency_code) = 3
  )
);

create table public.company_memberships (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.membership_role not null,
  status public.membership_status not null default 'invited',
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  unique (company_id, user_id),
  constraint company_memberships_no_super_admin_role
    check (role <> 'super_admin')
);

create table public.company_invitations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  email text not null,
  role public.membership_role not null,
  token text not null unique,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  invited_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, email),
  constraint company_invitations_no_super_admin_role
    check (role <> 'super_admin')
);

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  employee_code text not null,
  full_name text not null,
  work_email text not null,
  phone text,
  department text,
  job_title text,
  hire_date date,
  status public.employee_status not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  unique (company_id, employee_code),
  unique (company_id, work_email)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  sku text not null,
  name text not null,
  description text,
  category text,
  unit_price numeric(12, 2) not null default 0,
  stock_quantity integer not null default 0,
  reorder_threshold integer not null default 0,
  status public.product_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  unique (company_id, sku),
  constraint products_unit_price_non_negative check (unit_price >= 0),
  constraint products_stock_quantity_non_negative check (stock_quantity >= 0),
  constraint products_reorder_threshold_non_negative check (reorder_threshold >= 0)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  contact_person text,
  email text,
  phone text,
  billing_address text,
  status public.customer_status not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  invoice_number text not null,
  customer_id uuid not null,
  issue_date date not null,
  due_date date not null,
  status public.invoice_status not null default 'draft',
  subtotal numeric(12, 2) not null default 0,
  tax_amount numeric(12, 2) not null default 0,
  total_amount numeric(12, 2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  unique (company_id, invoice_number),
  unique (id, company_id),
  constraint invoices_subtotal_non_negative check (subtotal >= 0),
  constraint invoices_tax_amount_non_negative check (tax_amount >= 0),
  constraint invoices_total_amount_non_negative check (total_amount >= 0),
  constraint invoices_due_date_after_issue_date check (due_date >= issue_date)
);

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  invoice_id uuid not null,
  product_id uuid,
  description text not null,
  quantity numeric(12, 2) not null default 1,
  unit_price numeric(12, 2) not null default 0,
  line_total numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  constraint invoice_items_invoice_fk
    foreign key (invoice_id, company_id)
    references public.invoices (id, company_id)
    on delete cascade,
  constraint invoice_items_quantity_positive check (quantity > 0),
  constraint invoice_items_unit_price_non_negative check (unit_price >= 0),
  constraint invoice_items_line_total_non_negative check (line_total >= 0)
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  expense_date date not null,
  category text not null,
  vendor text,
  description text,
  amount numeric(12, 2) not null,
  status public.expense_status not null default 'draft',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  constraint expenses_amount_non_negative check (amount >= 0)
);

alter table public.products
  add constraint products_company_pair_unique unique (id, company_id);

alter table public.customers
  add constraint customers_company_pair_unique unique (id, company_id);

alter table public.invoice_items
  add constraint invoice_items_product_fk
    foreign key (product_id, company_id)
    references public.products (id, company_id)
    on delete set null;

alter table public.invoices
  add constraint invoices_customer_fk
    foreign key (customer_id, company_id)
    references public.customers (id, company_id)
    on delete restrict;

create index company_memberships_user_id_idx
  on public.company_memberships (user_id);

create index company_memberships_company_id_idx
  on public.company_memberships (company_id);

create index company_invitations_company_id_idx
  on public.company_invitations (company_id);

create index employees_company_id_idx
  on public.employees (company_id);

create index products_company_id_idx
  on public.products (company_id);

create index customers_company_id_idx
  on public.customers (company_id);

create index invoices_company_id_idx
  on public.invoices (company_id);

create index invoice_items_company_id_idx
  on public.invoice_items (company_id);

create index expenses_company_id_idx
  on public.expenses (company_id);

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger set_companies_updated_at
before update on public.companies
for each row
execute function public.set_updated_at();

create trigger set_company_memberships_updated_at
before update on public.company_memberships
for each row
execute function public.set_updated_at();

create trigger set_company_invitations_updated_at
before update on public.company_invitations
for each row
execute function public.set_updated_at();

create trigger set_employees_updated_at
before update on public.employees
for each row
execute function public.set_updated_at();

create trigger set_products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

create trigger set_customers_updated_at
before update on public.customers
for each row
execute function public.set_updated_at();

create trigger set_invoices_updated_at
before update on public.invoices
for each row
execute function public.set_updated_at();

create trigger set_invoice_items_updated_at
before update on public.invoice_items
for each row
execute function public.set_updated_at();

create trigger set_expenses_updated_at
before update on public.expenses
for each row
execute function public.set_updated_at();
