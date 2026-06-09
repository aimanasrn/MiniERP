# Hosted Supabase Auth With Demo Fallback

## Overview

MiniERP will move back to real Supabase-backed authentication while keeping the application running locally during development. The primary experience will use a hosted Supabase development project for email/password sign-in, magic links, invite acceptance, and email verification. The recently added local demo mode will remain available only as an explicit fallback so local reviews are never blocked by incomplete backend setup.

This design keeps the MVP aligned with the original architecture goals while preserving a practical local escape hatch.

## Goals

- Make hosted Supabase auth the default local development path.
- Preserve demo mode as a clearly secondary fallback.
- Support real local testing for:
  - login with password
  - magic link sign-in
  - email verification
  - invite acceptance
- Keep route guards and RBAC behavior consistent regardless of session source.
- Minimize rework by retaining the existing Supabase schema, auth helpers, and protected route structure.

## Non-Goals

- Local Docker-based Supabase orchestration in this phase
- Production deployment configuration
- Full multi-company switching UI
- Replacing demo data-backed module pages with live CRUD wiring in the same step unless already present

## Recommended Approach

Use a hosted Supabase dev project as the primary backend and gate demo mode behind an explicit environment flag.

### Why this approach

- It validates the real auth flows we actually want to ship.
- It avoids the extra operational setup of a full local Supabase stack.
- It lets the app keep working for demos and design review even before project credentials are configured.

## Auth Mode Design

### Mode Resolution

The app will support two auth modes:

- `supabase`
- `demo`

Mode resolution rules:

1. If valid Supabase env vars are present, the app defaults to `supabase`.
2. Demo mode is available only when an explicit flag such as `NEXT_PUBLIC_ENABLE_DEMO_MODE=true` is set.
3. If Supabase env vars are missing, the app may fall back to demo mode only if demo mode is enabled.
4. If neither Supabase nor demo mode is available, the login screen should show a clear setup-state message instead of failing at runtime.

This keeps the intended path unambiguous:

- Hosted Supabase is the real auth system.
- Demo mode is a convenience layer, not the main product path.

## Login Experience

### Supabase First

When Supabase is configured:

- The login page shows the real password and magic-link form.
- Invite-based onboarding continues to use the existing invite acceptance and callback flow.
- The page may include a secondary "Use demo workspace" entry only when demo fallback is enabled.

### Demo Fallback

When demo mode is enabled:

- The demo entry appears as a secondary option, visually less prominent than the real auth form.
- Demo access continues to use role-based quick entry and cookie-backed local session state.
- Demo session handling remains isolated from Supabase session cookies.

### Setup-State Experience

When Supabase is not configured and demo mode is off:

- The login page displays a setup notice explaining that auth requires Supabase configuration.
- The notice points developers to the environment and setup guide.
- The page should fail gracefully without throwing runtime errors.

## Session And Guard Design

### Session Resolution Priority

`getSession()` and related guard helpers will follow this order:

1. Resolve a real Supabase session when Supabase mode is active.
2. Resolve a demo session only when demo fallback is enabled and selected.
3. Return `null` when neither applies.

### Guard Behavior

Protected routes should continue to behave consistently:

- Unauthenticated users redirect to `/login`.
- Authenticated users are checked against role-based route access.
- Demo sessions and Supabase sessions produce the same `AppSession` shape.

This means the route guard and RBAC layers do not need separate page logic for each auth source.

## Environment Configuration

### Required Local Variables For Hosted Supabase

The local app will need:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Optional Demo Fallback Variable

- `NEXT_PUBLIC_ENABLE_DEMO_MODE=true`

### Callback And Redirect Expectations

The hosted Supabase project will need local development URLs configured for:

- site URL
- auth callback URL
- magic-link redirect URL
- invite acceptance flow

The design assumes local development will use a stable localhost URL such as `http://localhost:3000`.

## Supabase Project Setup

### Hosted Project Responsibilities

The hosted Supabase dev project should be configured with:

- Email/password auth enabled
- Magic link / OTP enabled
- Email confirmation behavior aligned with the MVP
- Redirect URLs for local development
- Existing database schema applied
- Existing RLS policies applied
- Optional seed data loaded for faster walkthroughs

### Data And Schema

The app already contains:

- initial schema migration
- RLS migration
- seed SQL

This step should reuse those assets rather than creating a parallel auth-only setup.

## Demo Mode Boundaries

Demo mode stays intentionally limited:

- It is for local review, UI walkthroughs, and development fallback.
- It should not be the default path when Supabase is configured.
- It should not silently override real auth behavior.
- It should remain clearly labeled as demo access in the UI.

This preserves developer convenience without confusing the app's real auth model.

## UI Changes

### Login Screen

The login page should support three clear states:

1. `Supabase configured`
   - show real auth form
   - optionally show demo fallback entry

2. `Supabase missing, demo enabled`
   - show demo entry as the primary option
   - optionally show setup guidance for enabling Supabase

3. `Supabase missing, demo disabled`
   - show setup-state messaging only

### Messaging

The copy should clearly distinguish:

- secure sign-in
- local demo workspace
- setup required

This avoids mixing operational modes and keeps the UX understandable.

## Testing Strategy

### Unit And Integration Coverage

Add or update tests for:

- auth mode resolution rules
- login page rendering for all three states
- demo fallback visibility conditions
- session resolution priority
- route guard behavior with Supabase and demo sessions

### Verification

Before implementation is considered complete:

- `npm run test` must pass
- `npm run build` must pass
- local manual smoke test should confirm:
  - password login flow
  - magic link initiation
  - demo fallback access when enabled
  - graceful setup-state rendering when env is incomplete

## Documentation Updates

Add lightweight local setup documentation covering:

- how to create the hosted Supabase dev project
- where to find the project URL and anon key
- how to set local env vars
- which redirect URLs to configure
- how to apply schema and seed SQL
- how to enable or disable demo fallback

## Risks And Mitigations

### Risk: Demo mode masks real auth issues

Mitigation:

- Demo mode is explicitly gated by env flag.
- Supabase auth stays the default whenever credentials are present.

### Risk: Runtime errors from missing env vars

Mitigation:

- Centralize auth mode resolution.
- Render setup-state UI instead of throwing in public auth pages when setup is incomplete.

### Risk: Inconsistent behavior between demo and real sessions

Mitigation:

- Keep a shared `AppSession` contract.
- Reuse the same RBAC and route guard logic for both session sources.

## Delivery Outcome

After this work:

- MiniERP will run locally against a hosted Supabase dev project.
- Real auth will be the primary path again.
- Demo mode will remain available as an explicit fallback.
- The local developer experience will be clearer and less fragile than either a demo-only path or a hard Supabase-only switch.
