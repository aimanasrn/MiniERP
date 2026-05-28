create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    auth.jwt() -> 'app_metadata' ->> 'role',
    ''
  ) = 'super_admin';
$$;

create or replace function public.is_company_member(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_memberships memberships
    where memberships.company_id = target_company_id
      and memberships.user_id = auth.uid()
      and memberships.status = 'active'
  );
$$;

create or replace function public.can_access_company(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_platform_admin()
    or public.is_company_member(target_company_id);
$$;

create or replace function public.has_company_role(
  target_company_id uuid,
  allowed_roles public.membership_role[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_memberships memberships
    where memberships.company_id = target_company_id
      and memberships.user_id = auth.uid()
      and memberships.status = 'active'
      and memberships.role = any(allowed_roles)
  );
$$;

create or replace function public.is_tenant_manageable_role(
  target_role public.membership_role
)
returns boolean
language sql
immutable
as $$
  select target_role <> 'super_admin';
$$;

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.company_memberships enable row level security;
alter table public.company_invitations enable row level security;
alter table public.employees enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.expenses enable row level security;

create policy "users can read their own profile"
on public.profiles
for select
using (id = auth.uid());

create policy "users can insert their own profile"
on public.profiles
for insert
with check (id = auth.uid());

create policy "users can update their own profile"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "company members can read companies"
on public.companies
for select
using (
  public.is_platform_admin()
  or public.is_company_member(id)
);

create policy "platform super admins can create companies"
on public.companies
for insert
with check (
  public.is_platform_admin()
  and (
    created_by is null
    or created_by = auth.uid()
  )
  and (
    updated_by is null
    or updated_by = auth.uid()
  )
);

create policy "company admins can update companies"
on public.companies
for update
using (
  public.is_platform_admin()
  or public.has_company_role(
    id,
    array['company_admin']::public.membership_role[]
  )
)
with check (
  public.is_platform_admin()
  or public.has_company_role(
    id,
    array['company_admin']::public.membership_role[]
  )
);

create policy "members can read company memberships"
on public.company_memberships
for select
using (
  public.is_platform_admin()
  or user_id = auth.uid()
  or public.is_company_member(company_id)
);

create policy "company admins can manage memberships"
on public.company_memberships
for all
using (
  public.is_platform_admin()
  or public.has_company_role(
    company_id,
    array['company_admin']::public.membership_role[]
  )
)
with check (
  public.is_platform_admin()
  or public.has_company_role(
    company_id,
    array['company_admin']::public.membership_role[]
  )
  and public.is_tenant_manageable_role(role)
);

create policy "company admins can read invitations"
on public.company_invitations
for select
using (
  public.is_platform_admin()
  or public.has_company_role(
    company_id,
    array['company_admin']::public.membership_role[]
  )
);

create policy "company admins can manage invitations"
on public.company_invitations
for all
using (
  public.is_platform_admin()
  or public.has_company_role(
    company_id,
    array['company_admin']::public.membership_role[]
  )
)
with check (
  public.is_platform_admin()
  or public.has_company_role(
    company_id,
    array['company_admin']::public.membership_role[]
  )
  and public.is_tenant_manageable_role(role)
);

create policy "company members can read employees"
on public.employees
for select
using (public.is_company_member(company_id));

create policy "employee managers can manage employees"
on public.employees
for all
using (
  public.has_company_role(
    company_id,
    array['company_admin', 'hr_manager']::public.membership_role[]
  )
)
with check (
  public.has_company_role(
    company_id,
    array['company_admin', 'hr_manager']::public.membership_role[]
  )
);

create policy "company members can read products"
on public.products
for select
using (public.is_company_member(company_id));

create policy "inventory managers can manage products"
on public.products
for all
using (
  public.has_company_role(
    company_id,
    array['company_admin', 'inventory_manager']::public.membership_role[]
  )
)
with check (
  public.has_company_role(
    company_id,
    array['company_admin', 'inventory_manager']::public.membership_role[]
  )
);

create policy "company members can read customers"
on public.customers
for select
using (public.is_company_member(company_id));

create policy "sales managers can manage customers"
on public.customers
for all
using (
  public.has_company_role(
    company_id,
    array['company_admin', 'sales_staff']::public.membership_role[]
  )
)
with check (
  public.has_company_role(
    company_id,
    array['company_admin', 'sales_staff']::public.membership_role[]
  )
);

create policy "company members can read invoices"
on public.invoices
for select
using (public.is_company_member(company_id));

create policy "finance team can manage invoices"
on public.invoices
for all
using (
  public.has_company_role(
    company_id,
    array['company_admin', 'finance_manager', 'sales_staff']::public.membership_role[]
  )
)
with check (
  public.has_company_role(
    company_id,
    array['company_admin', 'finance_manager', 'sales_staff']::public.membership_role[]
  )
);

create policy "company members can read invoice items"
on public.invoice_items
for select
using (public.is_company_member(company_id));

create policy "finance team can manage invoice items"
on public.invoice_items
for all
using (
  public.has_company_role(
    company_id,
    array['company_admin', 'finance_manager', 'sales_staff']::public.membership_role[]
  )
)
with check (
  public.has_company_role(
    company_id,
    array['company_admin', 'finance_manager', 'sales_staff']::public.membership_role[]
  )
);

create policy "company members can read expenses"
on public.expenses
for select
using (public.is_company_member(company_id));

create policy "finance team can manage expenses"
on public.expenses
for all
using (
  public.has_company_role(
    company_id,
    array['company_admin', 'finance_manager']::public.membership_role[]
  )
)
with check (
  public.has_company_role(
    company_id,
    array['company_admin', 'finance_manager']::public.membership_role[]
  )
);
