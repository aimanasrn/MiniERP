# MiniERP MVP Design

## Overview

MiniERP will be a modern ERP SaaS web application built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, Supabase, and PostgreSQL. The MVP will present a single-company workspace in the UI while keeping the underlying auth and data model multi-company ready. The product will use a clean light enterprise dashboard style with white and soft gray surfaces, blue accents, responsive layouts, sidebar navigation, reusable cards, tables, charts, and forms.

## MVP Goals

- Deliver a production-style SaaS dashboard foundation with protected routes and role-aware navigation.
- Support company-scoped data and role-based access control for all core MVP modules.
- Provide working CRUD flows backed by Supabase for employees, products, customers, invoices, and expenses.
- Include a simple reporting page that summarizes key operational data.
- Keep non-MVP ERP domains visible in navigation as placeholders without implementing their workflows yet.

## Out Of Scope For MVP

- Full payroll workflows
- Advanced accounting ledger and reconciliation
- Procurement workflow automation
- Multi-company switching in the end-user UI
- Advanced analytics and custom report builders
- Complex approval chains
- Deep employee self-service features

## Architecture

### Recommended Approach

Use a monolith-first Next.js application with Supabase as the backend. This keeps the MVP fast to deliver while maintaining strong boundaries between auth, data access, UI modules, and shared infrastructure.

### Technology Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase Auth
- Supabase Postgres
- Supabase Row Level Security

### Application Layers

1. Presentation layer
   - App Router pages and layouts
   - Reusable dashboard UI components
   - Role-aware sidebar and page actions

2. Server/data layer
   - Supabase server clients
   - Auth/session helpers
   - Module-specific query and mutation functions
   - Permission guard utilities

3. Persistence/security layer
   - PostgreSQL schema in Supabase
   - RLS policies
   - Database enums and constraints

## Tenancy Model

The MVP UI will operate as a single-company workspace. A user will act within one company context in the app, but the schema will support many companies from day one.

### Tenancy Rules

- Every business record belongs to exactly one company.
- Users can be members of companies through a membership table.
- The MVP will not expose a company switcher in the main app UI.
- Super Admin can manage companies in a separate platform admin area.
- All module queries and mutations will scope by company membership.

## Authentication And Access Model

### Authentication

Supabase Auth will provide:

- Email and password sign-in
- Magic link sign-in
- Email verification
- Invite acceptance flow for first Company Admin and future users

### User Lifecycle

1. Super Admin creates a company.
2. Super Admin invites the first Company Admin by email.
3. The invited user accepts the invitation.
4. The user verifies email and signs in through magic link or password.
5. The user completes any remaining company setup fields.

### Roles

- `super_admin`
- `company_admin`
- `hr_manager`
- `finance_manager`
- `inventory_manager`
- `sales_staff`
- `employee`

### Permission Strategy

Permissions will be enforced in three layers:

1. Navigation and page visibility
2. Server-side route and action guards
3. Supabase RLS policies

This avoids relying on client-side checks alone and ensures company data stays isolated.

## Data Model

### Auth And Tenancy Tables

#### `profiles`

Extends the Supabase auth user with app-specific fields.

Suggested fields:

- `id`
- `email`
- `full_name`
- `avatar_url`
- `status`
- `created_at`
- `updated_at`

#### `companies`

Stores tenant records.

Suggested fields:

- `id`
- `name`
- `slug`
- `industry`
- `country`
- `currency_code`
- `timezone`
- `status`
- `created_at`
- `updated_at`
- `created_by`

#### `company_memberships`

Links users to companies and assigns roles.

Suggested fields:

- `id`
- `company_id`
- `user_id`
- `role`
- `status`
- `joined_at`
- `created_at`
- `updated_at`

#### `company_invitations`

Tracks company invites.

Suggested fields:

- `id`
- `company_id`
- `email`
- `role`
- `token`
- `expires_at`
- `accepted_at`
- `invited_by`
- `created_at`

### Business Tables

#### `employees`

- `id`
- `company_id`
- `employee_code`
- `full_name`
- `work_email`
- `phone`
- `department`
- `job_title`
- `hire_date`
- `status`
- `notes`
- `created_at`
- `updated_at`
- `created_by`

#### `products`

- `id`
- `company_id`
- `sku`
- `name`
- `description`
- `category`
- `unit_price`
- `stock_quantity`
- `reorder_threshold`
- `status`
- `created_at`
- `updated_at`
- `created_by`

#### `customers`

- `id`
- `company_id`
- `name`
- `contact_person`
- `email`
- `phone`
- `billing_address`
- `status`
- `notes`
- `created_at`
- `updated_at`
- `created_by`

#### `invoices`

- `id`
- `company_id`
- `invoice_number`
- `customer_id`
- `issue_date`
- `due_date`
- `status`
- `subtotal`
- `tax_amount`
- `total_amount`
- `notes`
- `created_at`
- `updated_at`
- `created_by`

#### `invoice_items`

- `id`
- `invoice_id`
- `product_id`
- `description`
- `quantity`
- `unit_price`
- `line_total`

#### `expenses`

- `id`
- `company_id`
- `expense_date`
- `category`
- `vendor`
- `description`
- `amount`
- `status`
- `notes`
- `created_at`
- `updated_at`
- `created_by`

### Enums

Suggested enums for consistency:

- `membership_role`
- `membership_status`
- `company_status`
- `employee_status`
- `product_status`
- `customer_status`
- `invoice_status`
- `expense_status`

## RBAC Matrix

### Super Admin

- Manage all companies
- Invite first Company Admin
- View platform-level company list
- Bypass company scope only in platform admin pages

### Company Admin

- Full CRUD within assigned company
- Manage team memberships inside company
- View all MVP modules

### HR Manager

- Full employee management
- Read dashboard and reports relevant to HR
- No access to finance administration beyond shared summaries

### Finance Manager

- Full invoice and expense management
- Read reporting relevant to finance
- Limited or no access to HR and inventory editing

### Inventory Manager

- Full product and stock management
- Read inventory-related dashboard widgets

### Sales Staff

- Customer management
- Invoice creation and updates within allowed statuses
- Sales-oriented dashboard visibility

### Employee

- Basic dashboard access
- Read-only or self-limited access depending on page
- No administrative CRUD access to company data

## App Structure

## Route Groups

- `(public)`
  - login
  - register or invite acceptance
  - auth callback
  - email verification

- `(app)`
  - dashboard
  - company setup
  - employees
  - inventory
  - customers
  - invoices
  - expenses
  - reports

- `(platform)`
  - companies
  - invitations

### Shared Layout

Protected app pages will use a common shell with:

- Responsive sidebar navigation
- Top header with user profile and company context
- Main content area with breadcrumbs, actions, filters, and cards

## Navigation Structure

### Implemented MVP Entries

- Dashboard
- Company Setup
- Employees
- Inventory
- Customers
- Invoices
- Expenses
- Reports

### Placeholder Entries

- Payroll
- Accounting
- Procurement
- Sales module label if broader grouping is desired

Placeholder pages will display a clear "Coming soon" state while preserving the ERP information architecture.

## Feature Design

### 1. Authentication

Pages and flows:

- Login page
- Invite acceptance page
- Email verification page
- Auth callback handling for magic links

Requirements:

- Redirect authenticated users into protected app areas
- Reject unauthorized users from protected pages
- Enforce invitation-to-membership mapping

### 2. Company Setup

Purpose:

- Let Company Admin complete foundational company details after invite acceptance.

Fields:

- Company name
- Industry
- Country
- Currency
- Timezone

Behavior:

- Pre-filled when created by Super Admin where possible
- Editable by Company Admin

### 3. Dashboard

Purpose:

- Provide a role-aware landing page after login.

MVP widgets:

- Employee count
- Low-stock product count
- Invoice total summary
- Expense total summary
- Recent activity lists

Role behavior:

- Show and hide widgets based on role relevance
- Reuse the same layout frame to avoid fragmented UX

### 4. Employee Management

Capabilities:

- List
- Create
- View
- Edit
- Archive or deactivate

UI elements:

- Table with search and filters
- Slide-over or page form
- Status badges

Filters:

- Search
- Department
- Status

### 5. Product Inventory

Capabilities:

- List
- Create
- View
- Edit
- Archive or deactivate

Fields:

- SKU
- Name
- Category
- Unit price
- Stock quantity
- Reorder threshold
- Status

UX details:

- Highlight low-stock rows
- Support category and stock-state filtering

### 6. Customer Management

Capabilities:

- List
- Create
- View
- Edit
- Archive or deactivate

Fields:

- Name
- Contact person
- Email
- Phone
- Billing address
- Status

### 7. Invoice Creation

Capabilities:

- Create invoice
- Add invoice items
- Calculate totals
- List and filter invoices
- Update status

Statuses:

- Draft
- Sent
- Paid
- Overdue

Rules:

- Invoice items store a snapshot of pricing at creation time
- Totals are calculated consistently in the server/data layer

### 8. Expense Tracking

Capabilities:

- List
- Create
- View
- Edit
- Archive if needed

Fields:

- Date
- Category
- Vendor
- Description
- Amount
- Status
- Notes

### 9. Reporting

Purpose:

- Deliver a simple read-only reporting overview for the MVP.

Metrics:

- Employee totals
- Product stock summary and low-stock counts
- Invoice totals by status
- Expense totals by category or period

Presentation:

- KPI cards
- One or two lightweight charts
- Summary tables

## UI And Design System Direction

### Visual Theme

- Clean light mode only for MVP
- White and soft gray backgrounds
- Blue accent color
- Professional enterprise tone

### Core Reusable Components

- App shell
- Sidebar navigation
- Page header
- Stat cards
- Data table wrapper
- Empty states
- Status badges
- Filter bars
- Form sections
- Dialogs and drawers
- Role guard wrapper

### Responsive Behavior

- Sidebar collapses to mobile drawer
- Cards stack cleanly on small screens
- Tables support horizontal overflow with usable controls
- Forms use one or two-column layouts depending on viewport

## Suggested Folder Structure

```text
src/
  app/
    (public)/
    (app)/
    (platform)/
  components/
    ui/
    layout/
    shared/
  features/
    auth/
    dashboard/
    company/
    employees/
    inventory/
    customers/
    invoices/
    expenses/
    reports/
  lib/
    supabase/
    auth/
    rbac/
    utils/
    validations/
  types/
  hooks/
  config/
supabase/
  migrations/
  policies/
```

## Data Access Pattern

- Keep feature-specific queries and mutations close to each feature module.
- Centralize Supabase client creation and auth helpers in `lib/supabase`.
- Use server-side guards before all protected data access.
- Validate form inputs before persistence.
- Keep UI components unaware of raw RLS logic.

## Security Design

### Protected Routes

- Public routes remain accessible without authentication.
- Protected route groups redirect unauthenticated users to login.
- Authorized role checks run server-side before rendering sensitive pages.

### Row Level Security

RLS policies will:

- Restrict rows to the current user's company membership
- Restrict writes to allowed roles
- Permit Super Admin access only for platform-level tables and workflows

### Auditability

All key business tables include:

- `created_at`
- `updated_at`
- `created_by`

This gives traceability without building a full audit log system in the MVP.

## Error Handling

- Form validation errors shown inline
- Permission failures redirect to an unauthorized state or message
- Empty states designed for first-use workflows
- Server errors presented with safe, user-friendly messaging

## Testing Strategy

### Priority Coverage

- Auth flow and protected route behavior
- Role guard behavior
- Company scoping behavior
- CRUD happy paths for employees, products, customers, invoices, and expenses
- Basic reporting query coverage

### Test Types

- Unit tests for permission helpers and utility functions
- Integration tests for server actions or route handlers
- End-to-end smoke tests for key flows if time permits

## Delivery Outcome For MVP

At the end of this MVP, the app should provide:

- Working auth with magic link and email verification
- Super Admin company creation and first Company Admin invite flow
- Protected single-company workspace
- Role-aware dashboard and navigation
- Working CRUD for employees, products, customers, invoices, and expenses
- Simple reporting page
- Multi-company-ready schema and access model

## Future Expansion Path

After the MVP, the most natural next steps are:

- Company switcher and multi-company user context
- Payroll workflows
- Accounting ledgers and journal entries
- Procurement requests and purchase orders
- Advanced reporting and export
- Approval workflows and notifications
