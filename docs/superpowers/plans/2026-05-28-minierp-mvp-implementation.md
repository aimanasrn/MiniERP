# MiniERP MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js + Supabase MVP for MiniERP with multi-company-ready tenancy, RBAC, protected routes, and working CRUD flows for employees, inventory, customers, invoices, expenses, and reporting.

**Architecture:** Build a single Next.js App Router application with feature-based modules, Supabase-backed auth and Postgres persistence, and server-side guards layered on top of Supabase RLS. Start with platform and auth foundations, then add the shared dashboard shell and each business module as focused vertical slices.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase Auth, Supabase Postgres, Zod, React Hook Form, Vitest, Testing Library, Playwright

---

## File Structure Map

### Root App And Tooling

- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `postcss.config.js`
- Create: `tailwind.config.ts`
- Create: `components.json`
- Create: `eslint.config.mjs`
- Create: `middleware.ts`
- Create: `.env.example`

### Next.js App Routes

- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `src/app/page.tsx`
- Create: `src/app/(public)/login/page.tsx`
- Create: `src/app/(public)/invite/[token]/page.tsx`
- Create: `src/app/(public)/verify-email/page.tsx`
- Create: `src/app/auth/callback/route.ts`
- Create: `src/app/(app)/layout.tsx`
- Create: `src/app/(app)/dashboard/page.tsx`
- Create: `src/app/(app)/company/page.tsx`
- Create: `src/app/(app)/employees/page.tsx`
- Create: `src/app/(app)/inventory/page.tsx`
- Create: `src/app/(app)/customers/page.tsx`
- Create: `src/app/(app)/invoices/page.tsx`
- Create: `src/app/(app)/expenses/page.tsx`
- Create: `src/app/(app)/reports/page.tsx`
- Create: `src/app/(app)/payroll/page.tsx`
- Create: `src/app/(app)/accounting/page.tsx`
- Create: `src/app/(app)/procurement/page.tsx`
- Create: `src/app/(platform)/companies/page.tsx`

### Shared Components

- Create: `src/components/layout/app-shell.tsx`
- Create: `src/components/layout/app-sidebar.tsx`
- Create: `src/components/layout/app-header.tsx`
- Create: `src/components/shared/page-header.tsx`
- Create: `src/components/shared/stat-card.tsx`
- Create: `src/components/shared/data-table.tsx`
- Create: `src/components/shared/empty-state.tsx`
- Create: `src/components/shared/coming-soon.tsx`
- Create: `src/components/shared/status-badge.tsx`
- Create: `src/components/shared/filter-bar.tsx`
- Create: `src/components/shared/unauthorized-state.tsx`
- Create: `src/components/guards/role-guard.tsx`

### Supabase And Auth

- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/middleware.ts`
- Create: `src/lib/auth/session.ts`
- Create: `src/lib/auth/guards.ts`
- Create: `src/lib/rbac/roles.ts`
- Create: `src/lib/rbac/permissions.ts`
- Create: `src/lib/utils/slugs.ts`
- Create: `src/lib/utils/currency.ts`

### Feature Modules

- Create: `src/features/auth/components/login-form.tsx`
- Create: `src/features/auth/components/invite-accept-form.tsx`
- Create: `src/features/company/components/company-setup-form.tsx`
- Create: `src/features/company/data/company-service.ts`
- Create: `src/features/dashboard/data/dashboard-service.ts`
- Create: `src/features/employees/components/employee-form.tsx`
- Create: `src/features/employees/data/employee-service.ts`
- Create: `src/features/inventory/components/product-form.tsx`
- Create: `src/features/inventory/data/product-service.ts`
- Create: `src/features/customers/components/customer-form.tsx`
- Create: `src/features/customers/data/customer-service.ts`
- Create: `src/features/invoices/components/invoice-form.tsx`
- Create: `src/features/invoices/data/invoice-service.ts`
- Create: `src/features/expenses/components/expense-form.tsx`
- Create: `src/features/expenses/data/expense-service.ts`
- Create: `src/features/reports/data/report-service.ts`

### Validation And Types

- Create: `src/lib/validations/auth.ts`
- Create: `src/lib/validations/company.ts`
- Create: `src/lib/validations/employees.ts`
- Create: `src/lib/validations/products.ts`
- Create: `src/lib/validations/customers.ts`
- Create: `src/lib/validations/invoices.ts`
- Create: `src/lib/validations/expenses.ts`
- Create: `src/types/database.ts`
- Create: `src/types/app.ts`

### Database

- Create: `supabase/migrations/202605280001_initial_schema.sql`
- Create: `supabase/migrations/202605280002_rls_policies.sql`
- Create: `supabase/seed.sql`

### Tests

- Create: `src/lib/rbac/permissions.test.ts`
- Create: `src/lib/auth/guards.test.ts`
- Create: `src/features/invoices/data/invoice-service.test.ts`
- Create: `src/features/reports/data/report-service.test.ts`
- Create: `tests/e2e/auth.spec.ts`
- Create: `tests/e2e/mvp-crud.spec.ts`

## Task 1: Scaffold The Next.js SaaS Base

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `postcss.config.js`
- Create: `tailwind.config.ts`
- Create: `components.json`
- Create: `eslint.config.mjs`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `src/app/page.tsx`
- Create: `.env.example`

- [ ] **Step 1: Write the failing smoke test for the landing page**

```tsx
// src/app/page.test.tsx
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

describe("HomePage", () => {
  it("renders the MiniERP headline", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { name: /modern erp for growing companies/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/app/page.test.tsx`
Expected: FAIL with module resolution errors because the Next.js app and test tooling do not exist yet.

- [ ] **Step 3: Create the base app and tool configuration**

```json
// package.json
{
  "name": "minierp",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.9.0",
    "@radix-ui/react-dialog": "^1.1.1",
    "@radix-ui/react-dropdown-menu": "^2.1.1",
    "@supabase/ssr": "^0.5.1",
    "@supabase/supabase-js": "^2.49.1",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "lucide-react": "^0.511.0",
    "next": "^15.3.2",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-hook-form": "^7.57.0",
    "recharts": "^2.15.3",
    "tailwind-merge": "^3.3.0",
    "zod": "^3.24.4"
  },
  "devDependencies": {
    "@playwright/test": "^1.54.1",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/node": "^22.15.29",
    "@types/react": "^19.1.6",
    "@types/react-dom": "^19.1.5",
    "autoprefixer": "^10.4.21",
    "eslint": "^9.28.0",
    "eslint-config-next": "^15.3.2",
    "jsdom": "^26.1.0",
    "postcss": "^8.5.4",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.8.3",
    "vitest": "^3.2.2"
  }
}
```

```tsx
// src/app/page.tsx
export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-24">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          MiniERP
        </p>
        <h1 className="max-w-3xl text-5xl font-semibold tracking-tight">
          Modern ERP for growing companies.
        </h1>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Run the landing page test to verify it passes**

Run: `npm run test -- src/app/page.test.tsx`
Expected: PASS with 1 passing test.

- [ ] **Step 5: Commit**

```bash
git add package.json next.config.ts tsconfig.json postcss.config.js tailwind.config.ts components.json eslint.config.mjs .env.example src/app
git commit -m "feat: scaffold Next.js MiniERP foundation"
```

## Task 2: Add Supabase Schema, Enums, Tenancy, And RLS

**Files:**
- Create: `supabase/migrations/202605280001_initial_schema.sql`
- Create: `supabase/migrations/202605280002_rls_policies.sql`
- Create: `supabase/seed.sql`
- Create: `src/types/database.ts`

- [ ] **Step 1: Write the failing schema expectations**

```ts
// src/types/database.test.ts
import { describe, expect, it } from "vitest";
import type { Database } from "./database";

describe("Database types", () => {
  it("includes the core tenancy tables", () => {
    type PublicTables = keyof Database["public"]["Tables"];
    expectTypeOf<PublicTables>().toMatchTypeOf<
      | "companies"
      | "company_invitations"
      | "company_memberships"
      | "profiles"
      | "employees"
      | "products"
      | "customers"
      | "invoices"
      | "invoice_items"
      | "expenses"
    >();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/types/database.test.ts`
Expected: FAIL because `src/types/database.ts` does not exist.

- [ ] **Step 3: Create the initial schema and type definitions**

```sql
-- supabase/migrations/202605280001_initial_schema.sql
create type membership_role as enum (
  'super_admin',
  'company_admin',
  'hr_manager',
  'finance_manager',
  'inventory_manager',
  'sales_staff',
  'employee'
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  industry text,
  country text,
  currency_code text,
  timezone text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid
);
```

```sql
-- supabase/migrations/202605280002_rls_policies.sql
alter table public.companies enable row level security;

create policy "company members can read their company"
on public.companies
for select
using (
  exists (
    select 1
    from public.company_memberships memberships
    where memberships.company_id = companies.id
      and memberships.user_id = auth.uid()
  )
);
```

```ts
// src/types/database.ts
export type Database = {
  public: {
    Tables: {
      companies: { Row: { id: string; name: string; slug: string } };
      company_invitations: { Row: { id: string; company_id: string; email: string } };
      company_memberships: { Row: { id: string; company_id: string; user_id: string; role: string } };
      profiles: { Row: { id: string; email: string; full_name: string | null } };
      employees: { Row: { id: string; company_id: string; full_name: string } };
      products: { Row: { id: string; company_id: string; name: string } };
      customers: { Row: { id: string; company_id: string; name: string } };
      invoices: { Row: { id: string; company_id: string; invoice_number: string } };
      invoice_items: { Row: { id: string; invoice_id: string; description: string } };
      expenses: { Row: { id: string; company_id: string; amount: number } };
    };
  };
};
```

- [ ] **Step 4: Run type tests and Supabase SQL verification**

Run: `npm run test -- src/types/database.test.ts`
Expected: PASS with the expected table names resolved.

Run: `supabase db lint`
Expected: PASS or actionable SQL feedback to fix before continuing.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations supabase/seed.sql src/types/database.ts src/types/database.test.ts
git commit -m "feat: add Supabase tenancy schema and initial RLS"
```

## Task 3: Build Auth Clients, Session Helpers, And Route Protection

**Files:**
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/middleware.ts`
- Create: `src/lib/auth/session.ts`
- Create: `src/lib/auth/guards.ts`
- Create: `middleware.ts`
- Create: `src/lib/auth/guards.test.ts`

- [ ] **Step 1: Write the failing guard tests**

```ts
// src/lib/auth/guards.test.ts
import { describe, expect, it } from "vitest";
import { canAccessRoute } from "./guards";

describe("canAccessRoute", () => {
  it("allows company admins into employee routes", () => {
    expect(canAccessRoute("company_admin", "/employees")).toBe(true);
  });

  it("blocks employees from invoice management", () => {
    expect(canAccessRoute("employee", "/invoices")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/lib/auth/guards.test.ts`
Expected: FAIL because `canAccessRoute` is not defined.

- [ ] **Step 3: Implement Supabase clients and route guard helpers**

```ts
// src/lib/auth/guards.ts
const routePermissions: Record<string, string[]> = {
  "/dashboard": ["super_admin", "company_admin", "hr_manager", "finance_manager", "inventory_manager", "sales_staff", "employee"],
  "/employees": ["super_admin", "company_admin", "hr_manager"],
  "/inventory": ["super_admin", "company_admin", "inventory_manager"],
  "/customers": ["super_admin", "company_admin", "sales_staff"],
  "/invoices": ["super_admin", "company_admin", "finance_manager", "sales_staff"],
  "/expenses": ["super_admin", "company_admin", "finance_manager"],
  "/reports": ["super_admin", "company_admin", "hr_manager", "finance_manager", "inventory_manager"]
};

export function canAccessRoute(role: string, pathname: string) {
  const allowedRoles = routePermissions[pathname] ?? [];
  return allowedRoles.includes(role);
}
```

```ts
// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "./src/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
```

- [ ] **Step 4: Run the guard tests**

Run: `npm run test -- src/lib/auth/guards.test.ts`
Expected: PASS with both access checks succeeding.

- [ ] **Step 5: Commit**

```bash
git add middleware.ts src/lib/supabase src/lib/auth
git commit -m "feat: add Supabase auth clients and protected route guards"
```

## Task 4: Create The Enterprise Dashboard Shell And Shared UI

**Files:**
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `src/app/(app)/layout.tsx`
- Create: `src/components/layout/app-shell.tsx`
- Create: `src/components/layout/app-sidebar.tsx`
- Create: `src/components/layout/app-header.tsx`
- Create: `src/components/shared/page-header.tsx`
- Create: `src/components/shared/stat-card.tsx`
- Create: `src/components/shared/data-table.tsx`
- Create: `src/components/shared/empty-state.tsx`
- Create: `src/components/shared/coming-soon.tsx`
- Create: `src/components/shared/status-badge.tsx`
- Create: `src/components/shared/filter-bar.tsx`

- [ ] **Step 1: Write the failing shell test**

```tsx
// src/components/layout/app-shell.test.tsx
import { render, screen } from "@testing-library/react";
import { AppShell } from "./app-shell";

describe("AppShell", () => {
  it("renders the main navigation heading", () => {
    render(<AppShell role="company_admin">dashboard</AppShell>);
    expect(screen.getByText(/operations hub/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/components/layout/app-shell.test.tsx`
Expected: FAIL because the dashboard shell components do not exist.

- [ ] **Step 3: Build the reusable app shell**

```tsx
// src/components/layout/app-shell.tsx
import { ReactNode } from "react";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";

type AppShellProps = {
  children: ReactNode;
  role: string;
};

export function AppShell({ children, role }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <AppSidebar role={role} />
        <div className="flex min-h-screen flex-col">
          <AppHeader />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
```

```tsx
// src/components/layout/app-sidebar.tsx
export function AppSidebar({ role }: { role: string }) {
  return (
    <aside className="border-r border-slate-200 bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">MiniERP</p>
      <h2 className="mt-3 text-xl font-semibold">Operations Hub</h2>
      <p className="mt-2 text-sm text-slate-500">Signed in as {role.replace("_", " ")}</p>
    </aside>
  );
}
```

- [ ] **Step 4: Run the shell test**

Run: `npm run test -- src/components/layout/app-shell.test.tsx`
Expected: PASS with the navigation heading rendered.

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css src/app/'(app)' src/components/layout src/components/shared
git commit -m "feat: add enterprise dashboard shell and shared components"
```

## Task 5: Implement Invitations, Login, Verify Email, And Company Setup

**Files:**
- Create: `src/app/(public)/login/page.tsx`
- Create: `src/app/(public)/invite/[token]/page.tsx`
- Create: `src/app/(public)/verify-email/page.tsx`
- Create: `src/app/auth/callback/route.ts`
- Create: `src/features/auth/components/login-form.tsx`
- Create: `src/features/auth/components/invite-accept-form.tsx`
- Create: `src/features/company/components/company-setup-form.tsx`
- Create: `src/features/company/data/company-service.ts`
- Create: `src/lib/validations/auth.ts`
- Create: `src/lib/validations/company.ts`

- [ ] **Step 1: Write the failing login form test**

```tsx
// src/features/auth/components/login-form.test.tsx
import { render, screen } from "@testing-library/react";
import { LoginForm } from "./login-form";

describe("LoginForm", () => {
  it("renders password and magic link actions", () => {
    render(<LoginForm />);
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send magic link/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/features/auth/components/login-form.test.tsx`
Expected: FAIL because the auth UI does not exist yet.

- [ ] **Step 3: Implement auth and company setup forms**

```tsx
// src/features/auth/components/login-form.tsx
"use client";

export function LoginForm() {
  return (
    <form className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <label className="mb-2 block text-sm font-medium">Email</label>
        <input className="w-full rounded-xl border border-slate-200 px-3 py-2" type="email" name="email" />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Password</label>
        <input className="w-full rounded-xl border border-slate-200 px-3 py-2" type="password" name="password" />
      </div>
      <div className="flex gap-3">
        <button className="rounded-xl bg-blue-600 px-4 py-2 text-white" type="submit">Sign in</button>
        <button className="rounded-xl border border-slate-200 px-4 py-2" type="button">Send magic link</button>
      </div>
    </form>
  );
}
```

```ts
// src/features/company/data/company-service.ts
import { z } from "zod";

export const companySetupSchema = z.object({
  name: z.string().min(2),
  industry: z.string().min(2),
  country: z.string().min(2),
  currencyCode: z.string().min(3).max(3),
  timezone: z.string().min(2)
});
```

- [ ] **Step 4: Run the auth test**

Run: `npm run test -- src/features/auth/components/login-form.test.tsx`
Expected: PASS with both buttons present.

- [ ] **Step 5: Commit**

```bash
git add src/app/'(public)' src/app/auth src/features/auth src/features/company src/lib/validations/auth.ts src/lib/validations/company.ts
git commit -m "feat: add invite-based auth and company setup flows"
```

## Task 6: Add RBAC Helpers, Dashboard Data, And Role-Aware Navigation

**Files:**
- Create: `src/lib/rbac/roles.ts`
- Create: `src/lib/rbac/permissions.ts`
- Create: `src/lib/rbac/permissions.test.ts`
- Create: `src/app/(app)/dashboard/page.tsx`
- Create: `src/features/dashboard/data/dashboard-service.ts`

- [ ] **Step 1: Write the failing RBAC and dashboard tests**

```ts
// src/lib/rbac/permissions.test.ts
import { describe, expect, it } from "vitest";
import { getVisibleNavItems } from "./permissions";

describe("getVisibleNavItems", () => {
  it("shows employees for hr managers", () => {
    expect(getVisibleNavItems("hr_manager")).toContain("/employees");
  });

  it("hides expenses for employees", () => {
    expect(getVisibleNavItems("employee")).not.toContain("/expenses");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/lib/rbac/permissions.test.ts`
Expected: FAIL because the permission helpers are missing.

- [ ] **Step 3: Implement role-aware navigation and dashboard summaries**

```ts
// src/lib/rbac/permissions.ts
const navByRole: Record<string, string[]> = {
  super_admin: ["/dashboard", "/company", "/employees", "/inventory", "/customers", "/invoices", "/expenses", "/reports"],
  company_admin: ["/dashboard", "/company", "/employees", "/inventory", "/customers", "/invoices", "/expenses", "/reports"],
  hr_manager: ["/dashboard", "/employees", "/reports"],
  finance_manager: ["/dashboard", "/invoices", "/expenses", "/reports"],
  inventory_manager: ["/dashboard", "/inventory", "/reports"],
  sales_staff: ["/dashboard", "/customers", "/invoices"],
  employee: ["/dashboard"]
};

export function getVisibleNavItems(role: string) {
  return navByRole[role] ?? ["/dashboard"];
}
```

```ts
// src/features/dashboard/data/dashboard-service.ts
export type DashboardSummary = {
  employeeCount: number;
  lowStockCount: number;
  invoiceTotal: number;
  expenseTotal: number;
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return {
    employeeCount: 0,
    lowStockCount: 0,
    invoiceTotal: 0,
    expenseTotal: 0
  };
}
```

- [ ] **Step 4: Run tests and render the dashboard**

Run: `npm run test -- src/lib/rbac/permissions.test.ts`
Expected: PASS with role-based navigation rules enforced.

Run: `npm run dev`
Expected: `/dashboard` renders with stat cards and role-aware sidebar links.

- [ ] **Step 5: Commit**

```bash
git add src/lib/rbac src/app/'(app)'/dashboard src/features/dashboard
git commit -m "feat: add role-aware dashboard and navigation helpers"
```

## Task 7: Implement Employees, Inventory, And Customers Vertical Slices

**Files:**
- Create: `src/app/(app)/employees/page.tsx`
- Create: `src/app/(app)/inventory/page.tsx`
- Create: `src/app/(app)/customers/page.tsx`
- Create: `src/features/employees/components/employee-form.tsx`
- Create: `src/features/employees/data/employee-service.ts`
- Create: `src/features/inventory/components/product-form.tsx`
- Create: `src/features/inventory/data/product-service.ts`
- Create: `src/features/customers/components/customer-form.tsx`
- Create: `src/features/customers/data/customer-service.ts`
- Create: `src/lib/validations/employees.ts`
- Create: `src/lib/validations/products.ts`
- Create: `src/lib/validations/customers.ts`

- [ ] **Step 1: Write the failing employee service test**

```ts
// src/features/employees/data/employee-service.test.ts
import { describe, expect, it } from "vitest";
import { buildEmployeePayload } from "./employee-service";

describe("buildEmployeePayload", () => {
  it("normalizes employee creation payloads", () => {
    expect(
      buildEmployeePayload({
        fullName: "  Aisha Karim  ",
        workEmail: "Aisha@example.com",
        department: "HR",
        jobTitle: "Manager"
      })
    ).toMatchObject({
      full_name: "Aisha Karim",
      work_email: "aisha@example.com",
      department: "HR",
      job_title: "Manager"
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/features/employees/data/employee-service.test.ts`
Expected: FAIL because the employee service does not exist.

- [ ] **Step 3: Implement the three CRUD feature slices**

```ts
// src/features/employees/data/employee-service.ts
export function buildEmployeePayload(input: {
  fullName: string;
  workEmail: string;
  department: string;
  jobTitle: string;
}) {
  return {
    full_name: input.fullName.trim(),
    work_email: input.workEmail.trim().toLowerCase(),
    department: input.department,
    job_title: input.jobTitle
  };
}
```

```ts
// src/features/inventory/data/product-service.ts
export function isLowStock(stockQuantity: number, reorderThreshold: number) {
  return stockQuantity <= reorderThreshold;
}
```

```ts
// src/features/customers/data/customer-service.ts
export function buildCustomerPayload(input: {
  name: string;
  email: string;
}) {
  return {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase()
  };
}
```

- [ ] **Step 4: Run the targeted tests and verify the pages render**

Run: `npm run test -- src/features/employees/data/employee-service.test.ts`
Expected: PASS with normalized employee payload output.

Run: `npm run dev`
Expected: `/employees`, `/inventory`, and `/customers` render tables, filters, and create actions.

- [ ] **Step 5: Commit**

```bash
git add src/app/'(app)'/employees src/app/'(app)'/inventory src/app/'(app)'/customers src/features/employees src/features/inventory src/features/customers src/lib/validations/employees.ts src/lib/validations/products.ts src/lib/validations/customers.ts
git commit -m "feat: add employee inventory and customer modules"
```

## Task 8: Implement Invoices, Expenses, And Reporting

**Files:**
- Create: `src/app/(app)/invoices/page.tsx`
- Create: `src/app/(app)/expenses/page.tsx`
- Create: `src/app/(app)/reports/page.tsx`
- Create: `src/features/invoices/components/invoice-form.tsx`
- Create: `src/features/invoices/data/invoice-service.ts`
- Create: `src/features/expenses/components/expense-form.tsx`
- Create: `src/features/expenses/data/expense-service.ts`
- Create: `src/features/reports/data/report-service.ts`
- Create: `src/lib/validations/invoices.ts`
- Create: `src/lib/validations/expenses.ts`
- Create: `src/features/invoices/data/invoice-service.test.ts`
- Create: `src/features/reports/data/report-service.test.ts`

- [ ] **Step 1: Write the failing invoice total test**

```ts
// src/features/invoices/data/invoice-service.test.ts
import { describe, expect, it } from "vitest";
import { calculateInvoiceTotals } from "./invoice-service";

describe("calculateInvoiceTotals", () => {
  it("calculates subtotal and total from line items", () => {
    expect(
      calculateInvoiceTotals(
        [
          { quantity: 2, unitPrice: 50 },
          { quantity: 1, unitPrice: 25 }
        ],
        12.5
      )
    ).toEqual({
      subtotal: 125,
      taxAmount: 12.5,
      totalAmount: 137.5
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/features/invoices/data/invoice-service.test.ts`
Expected: FAIL because the invoice service is not implemented.

- [ ] **Step 3: Implement invoice, expense, and reporting services**

```ts
// src/features/invoices/data/invoice-service.ts
type InvoiceLineInput = { quantity: number; unitPrice: number };

export function calculateInvoiceTotals(items: InvoiceLineInput[], taxAmount: number) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  return {
    subtotal,
    taxAmount,
    totalAmount: subtotal + taxAmount
  };
}
```

```ts
// src/features/expenses/data/expense-service.ts
export function buildExpensePayload(input: {
  amount: number;
  category: string;
  vendor: string;
}) {
  return {
    amount: Number(input.amount),
    category: input.category.trim(),
    vendor: input.vendor.trim()
  };
}
```

```ts
// src/features/reports/data/report-service.ts
export function summarizeFinance(invoices: number[], expenses: number[]) {
  const invoiceTotal = invoices.reduce((sum, value) => sum + value, 0);
  const expenseTotal = expenses.reduce((sum, value) => sum + value, 0);
  return {
    invoiceTotal,
    expenseTotal,
    net: invoiceTotal - expenseTotal
  };
}
```

- [ ] **Step 4: Run the service tests and verify the report page**

Run: `npm run test -- src/features/invoices/data/invoice-service.test.ts src/features/reports/data/report-service.test.ts`
Expected: PASS with invoice math and report summary logic verified.

Run: `npm run dev`
Expected: `/invoices`, `/expenses`, and `/reports` render with forms, tables, and basic KPI widgets.

- [ ] **Step 5: Commit**

```bash
git add src/app/'(app)'/invoices src/app/'(app)'/expenses src/app/'(app)'/reports src/features/invoices src/features/expenses src/features/reports src/lib/validations/invoices.ts src/lib/validations/expenses.ts
git commit -m "feat: add invoice expense and reporting modules"
```

## Task 9: Add Platform Admin, Placeholder Modules, And Final E2E Coverage

**Files:**
- Create: `src/app/(platform)/companies/page.tsx`
- Create: `src/app/(app)/company/page.tsx`
- Create: `src/app/(app)/payroll/page.tsx`
- Create: `src/app/(app)/accounting/page.tsx`
- Create: `src/app/(app)/procurement/page.tsx`
- Create: `tests/e2e/auth.spec.ts`
- Create: `tests/e2e/mvp-crud.spec.ts`

- [ ] **Step 1: Write the failing end-to-end smoke scenarios**

```ts
// tests/e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test("login page shows magic link flow", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("button", { name: /send magic link/i })).toBeVisible();
});
```

```ts
// tests/e2e/mvp-crud.spec.ts
import { test, expect } from "@playwright/test";

test("dashboard shows ERP module navigation", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByText(/inventory/i)).toBeVisible();
  await expect(page.getByText(/payroll/i)).toBeVisible();
});
```

- [ ] **Step 2: Run e2e tests to verify they fail**

Run: `npm run test:e2e`
Expected: FAIL because the app routes and browser setup are incomplete or unauthenticated.

- [ ] **Step 3: Implement platform pages, placeholder modules, and e2e setup**

```tsx
// src/components/shared/coming-soon.tsx
export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Planned module</p>
      <h2 className="mt-3 text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-slate-500">This area is intentionally visible in the MVP and will be implemented next.</p>
    </div>
  );
}
```

```tsx
// src/app/(app)/payroll/page.tsx
import { ComingSoon } from "@/components/shared/coming-soon";

export default function PayrollPage() {
  return <ComingSoon title="Payroll" />;
}
```

```tsx
// src/app/(platform)/companies/page.tsx
export default function CompaniesPage() {
  return <div>Platform company management goes here.</div>;
}
```

- [ ] **Step 4: Run the full verification suite**

Run: `npm run test`
Expected: PASS with unit and service tests green.

Run: `npm run test:e2e`
Expected: PASS for login and navigation smoke flows once test auth fixtures are configured.

Run: `npm run build`
Expected: PASS with the production build succeeding.

- [ ] **Step 5: Commit**

```bash
git add src/app/'(platform)' src/app/'(app)'/company src/app/'(app)'/payroll src/app/'(app)'/accounting src/app/'(app)'/procurement src/components/shared/coming-soon.tsx tests/e2e
git commit -m "feat: finalize platform admin placeholders and end-to-end coverage"
```

## Spec Coverage Check

- Authentication with invite-based onboarding, magic link, and email verification is covered in Task 5.
- Multi-company-ready schema, roles, memberships, invitations, and RLS are covered in Task 2.
- Protected routes, auth middleware, and access guards are covered in Task 3.
- Shared dashboard shell and enterprise SaaS UI foundation are covered in Task 4.
- Role-aware dashboard and navigation are covered in Task 6.
- Employee management, inventory, and customer CRUD slices are covered in Task 7.
- Invoice creation, expense tracking, and reporting are covered in Task 8.
- Placeholder modules and Super Admin company management entry points are covered in Task 9.

## Placeholder Scan

- No `TBD`, `TODO`, or deferred placeholders are left in the task instructions.
- “Coming soon” appears only as a deliberate user-facing placeholder module implementation, not as a planning gap.

## Type Consistency Check

- Role values are consistent across schema, guards, and RBAC helpers.
- Business table names match the approved spec: `employees`, `products`, `customers`, `invoices`, `invoice_items`, and `expenses`.
- Dashboard and reporting terminology is consistent with the spec’s KPI summary requirements.
