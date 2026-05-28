-- Local development seed for the current RLS/app model.
--
-- This file intentionally avoids inserting into auth.users.
-- Without a real authenticated user and company membership, company-scoped
-- business records are not reachable through normal app flows under the
-- current RLS rules, so this seed only bootstraps platform-visible records:
-- a company plus a pending company-admin invitation.
--
-- Practical local workflow:
-- 1. Sign in locally and create a real auth user through Supabase Auth.
-- 2. If you are testing platform admin flows, set that user's
--    app_metadata.role to 'super_admin'.
-- 3. Use the app or SQL to create an active company_memberships row for your
--    user before inserting employees/products/customers/invoices/expenses.
--
insert into public.companies (
  id,
  name,
  slug,
  industry,
  country,
  currency_code,
  timezone,
  status
)
values (
  '11111111-1111-1111-1111-111111111111',
  'Acme Manufacturing',
  'acme-manufacturing',
  'Manufacturing',
  'Malaysia',
  'MYR',
  'Asia/Kuala_Lumpur',
  'active'
)
on conflict (id) do nothing;

insert into public.company_invitations (
  id,
  company_id,
  email,
  role,
  token,
  expires_at
)
values (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'admin@acme.test',
  'company_admin',
  'seed-company-admin-token',
  now() + interval '7 days'
)
on conflict (id) do nothing;
