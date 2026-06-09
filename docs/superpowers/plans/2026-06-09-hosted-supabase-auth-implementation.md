# Hosted Supabase Auth With Demo Fallback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make hosted Supabase auth the primary local development path while preserving the local demo workspace as an explicit fallback behind an environment flag.

**Architecture:** The implementation will keep one shared `AppSession` contract and one shared RBAC/guard path, then switch auth source selection through a small auth-mode layer. The public login page will render one of three states based on environment configuration: Supabase-first, demo-primary, or setup-state.

**Tech Stack:** Next.js App Router, TypeScript, React, Supabase SSR, Supabase Auth, Vitest, Testing Library

---

## File Structure

- Create: `src/lib/auth/mode.ts`
  - Central auth-mode helpers for detecting configured Supabase env vars and whether demo fallback is enabled.
- Create: `src/lib/auth/demo.ts`
  - Demo cookie constant and demo-role helpers that are safe to import from client and server code.
- Modify: `src/lib/auth/session.ts`
  - Use auth-mode helpers to prioritize Supabase sessions and fall back to demo sessions only when explicitly allowed.
- Modify: `src/app/(public)/login/page.tsx`
  - Render the correct login state for hosted Supabase, demo fallback, or setup-state.
- Modify: `src/features/auth/components/login-form.tsx`
  - Keep real Supabase auth UI as the primary form and optionally show demo fallback access.
- Modify: `src/lib/auth/session.test.ts`
  - Add coverage for session resolution and demo session shape.
- Modify: `src/features/auth/components/login-form.test.tsx`
  - Add coverage for demo fallback visibility and redirect behavior.
- Modify: `src/app/(public)/login/page.test.tsx`
  - Add coverage for Supabase-configured and setup-state rendering.
- Modify: `tests/e2e/auth.spec.ts`
  - Update the auth smoke test to assert the correct login experience for local fallback mode.
- Modify: `.env.example`
  - Document hosted Supabase env vars and demo fallback flag.
- Create: `docs/local-supabase-hosted-setup.md`
  - Lightweight guide for connecting the local app to a hosted Supabase development project.
- Modify: `package.json`
  - Keep Supabase runtime dependencies present if missing.

---

### Task 1: Add Auth Mode Helpers

**Files:**
- Create: `src/lib/auth/mode.ts`
- Create: `src/lib/auth/demo.ts`
- Test: `src/lib/auth/session.test.ts`

- [ ] **Step 1: Write the failing test**

Add a new auth-mode test block to `src/lib/auth/session.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { getDemoSession } from "./session";
import { DEMO_SESSION_COOKIE, isDemoRole } from "./demo";

describe("demo auth helpers", () => {
  it("exports a stable demo cookie name", () => {
    expect(DEMO_SESSION_COOKIE).toBe("minierp-demo-role");
  });

  it("accepts valid membership roles as demo roles", () => {
    expect(isDemoRole("finance_manager")).toBe(true);
    expect(isDemoRole("employee")).toBe(true);
    expect(isDemoRole("not-a-role")).toBe(false);
  });

  it("builds a local demo session for the selected role", () => {
    const session = getDemoSession("finance_manager");

    expect(session.role).toBe("finance_manager");
    expect(session.companyId).toBe("demo-company");
    expect(session.profile?.email).toBe("finance.manager@demo.minierp.local");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd run test -- src/lib/auth/session.test.ts`

Expected: FAIL because `src/lib/auth/demo.ts` does not exist yet and the new exports cannot be resolved.

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/auth/demo.ts`:

```ts
import type { MembershipRole } from "@/types/database";

export const DEMO_SESSION_COOKIE = "minierp-demo-role";
export const DEMO_COMPANY_ID = "demo-company";
export const DEMO_JOINED_AT = "2026-01-01T00:00:00.000Z";

export function isDemoRole(value: unknown): value is MembershipRole {
  return (
    value === "super_admin" ||
    value === "company_admin" ||
    value === "hr_manager" ||
    value === "finance_manager" ||
    value === "inventory_manager" ||
    value === "sales_staff" ||
    value === "employee"
  );
}
```

Create `src/lib/auth/mode.ts`:

```ts
export type AuthMode = "supabase" | "demo" | "setup";

export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function isDemoModeEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === "true";
}

export function getAuthMode(): AuthMode {
  if (hasSupabaseEnv()) {
    return "supabase";
  }

  if (isDemoModeEnabled()) {
    return "demo";
  }

  return "setup";
}
```

Confirm `src/lib/auth/session.ts` imports the demo constants from `./demo` instead of defining them inline:

```ts
import {
  DEMO_COMPANY_ID,
  DEMO_JOINED_AT,
  DEMO_SESSION_COOKIE,
  isDemoRole,
} from "./demo";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd run test -- src/lib/auth/session.test.ts`

Expected: PASS with the demo-helper assertions succeeding.

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth/demo.ts src/lib/auth/mode.ts src/lib/auth/session.ts src/lib/auth/session.test.ts
git commit -m "feat: add auth mode and demo helper foundation"
```

---

### Task 2: Make Supabase The Primary Session Source

**Files:**
- Modify: `src/lib/auth/session.ts`
- Test: `src/lib/auth/session.test.ts`

- [ ] **Step 1: Write the failing test**

Extend `src/lib/auth/session.test.ts` with a pure-unit test for auth mode behavior:

```ts
import { describe, expect, it, vi } from "vitest";

vi.mock("./mode", () => ({
  getAuthMode: vi.fn(),
}));

describe("getSession auth source priority", () => {
  it("returns null in setup mode without attempting demo fallback", async () => {
    const { getAuthMode } = await import("./mode");
    const { getSession } = await import("./session");

    vi.mocked(getAuthMode).mockReturnValue("setup");

    await expect(getSession()).resolves.toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd run test -- src/lib/auth/session.test.ts`

Expected: FAIL because `getAuthMode()` currently resolves only `supabase` and `demo`, not a setup-state path.

- [ ] **Step 3: Write minimal implementation**

Update `src/lib/auth/session.ts` so `getSession()` branches cleanly by mode:

```ts
export async function getSession(
  options?: {
    client?: AppSupabaseClient;
    user?: User | null;
  },
): Promise<AppSession | null> {
  const authMode = getAuthMode();

  if (authMode === "setup") {
    return null;
  }

  if (authMode === "demo") {
    const cookieStore = await cookies();
    const selectedRole = cookieStore.get(DEMO_SESSION_COOKIE)?.value;

    if (!isDemoRole(selectedRole)) {
      return null;
    }

    return getDemoSession(selectedRole);
  }

  const supabase = options?.client ?? (await createSupabaseServerClient());
  let user = options?.user ?? null;
  // keep the existing Supabase auth.getUser(), profile query, and memberships query path unchanged
}
```

Keep `getDemoSession()` returning the same `AppSession` shape so route guards do not branch.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd run test -- src/lib/auth/session.test.ts`

Expected: PASS with setup mode returning `null` and existing demo-session tests still green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth/session.ts src/lib/auth/session.test.ts src/lib/auth/mode.ts
git commit -m "feat: prioritize hosted auth with setup-aware session resolution"
```

---

### Task 3: Restore Supabase-First Login UI With Demo Fallback

**Files:**
- Modify: `src/app/(public)/login/page.tsx`
- Modify: `src/features/auth/components/login-form.tsx`
- Modify: `src/features/auth/components/login-form.test.tsx`
- Modify: `src/app/(public)/login/page.test.tsx`
- Modify: `tests/e2e/auth.spec.ts`

- [ ] **Step 1: Write the failing tests**

Update `src/app/(public)/login/page.test.tsx` to cover setup-state and Supabase-first rendering:

```ts
import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import LoginPage from "./page";

vi.mock("@/lib/auth/mode", () => ({
  getAuthMode: vi.fn(),
  isDemoModeEnabled: vi.fn(),
}));

describe("LoginPage", () => {
  it("renders setup guidance when no auth mode is available", async () => {
    const { getAuthMode } = await import("@/lib/auth/mode");
    vi.mocked(getAuthMode).mockReturnValue("setup");

    render(await LoginPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByText(/requires supabase configuration/i)).toBeInTheDocument();
  });
});
```

Update `src/features/auth/components/login-form.test.tsx` with a visibility assertion:

```ts
it("shows demo fallback entry in demo-capable supabase mode", () => {
  render(<LoginForm mode="supabase" nextPath="/dashboard" showDemoFallback />);

  expect(
    screen.getByRole("button", { name: /use demo workspace/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /send magic link/i }),
  ).toBeInTheDocument();
});
```

Update `tests/e2e/auth.spec.ts` so the smoke expectation matches the current local fallback behavior:

```ts
expect(
  screen.getByRole("heading", {
    name: /open the erpflow demo workspace locally/i,
  }),
).toBeInTheDocument();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd run test -- src/app/(public)/login/page.test.tsx src/features/auth/components/login-form.test.tsx tests/e2e/auth.spec.ts`

Expected: FAIL because the page does not yet render the setup-state messaging and the form does not yet expose a secondary demo fallback button in Supabase mode.

- [ ] **Step 3: Write minimal implementation**

Update the page-level auth-state selection in `src/app/(public)/login/page.tsx`:

```ts
const authMode = getAuthMode();
const demoEnabled = isDemoModeEnabled();

if (authMode === "supabase") {
  const session = await getSession();

  if (session?.role) {
    redirect(getDefaultAuthorizedPath(session.role));
  }
}

const isSetupState = authMode === "setup";
```

Render the three page states:

```tsx
<h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
  {authMode === "supabase"
    ? "Sign in to continue your company workspace."
    : authMode === "demo"
      ? "Open the ERPFlow demo workspace locally."
      : "This workspace requires Supabase configuration."}
</h1>
```

Pass fallback visibility into the form:

```tsx
<LoginForm
  mode={authMode === "setup" ? "supabase" : authMode}
  nextPath={nextPath}
  showDemoFallback={authMode === "supabase" && demoEnabled}
/>
```

Update `src/features/auth/components/login-form.tsx` to support a secondary fallback button:

```ts
type LoginFormProps = {
  mode?: "supabase" | "demo";
  nextPath?: string;
  showDemoFallback?: boolean;
};
```

Render the fallback entry in Supabase mode:

```tsx
{showDemoFallback ? (
  <div className="rounded-3xl border border-cyan-200 bg-cyan-50/60 p-4">
    <p className="text-sm font-medium text-slate-900">Need a quick walkthrough?</p>
    <p className="mt-1 text-sm text-slate-600">
      Use the local demo workspace without affecting your Supabase auth session.
    </p>
    <button
      className="mt-3 inline-flex rounded-full border border-cyan-300 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100"
      onClick={() => handleDemoRoleSelection("company_admin")}
      type="button"
    >
      Use demo workspace
    </button>
  </div>
) : null}
```

For the setup-state page body in `src/app/(public)/login/page.tsx`, add:

```tsx
{isSetupState ? (
  <div className="rounded-[28px] border border-amber-200 bg-amber-50/90 p-5 text-sm shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
      Setup required
    </p>
    <p className="mt-2 leading-6 text-amber-900">
      This workspace requires Supabase configuration before secure sign-in can be used.
    </p>
  </div>
) : null}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd run test -- src/app/(public)/login/page.test.tsx src/features/auth/components/login-form.test.tsx tests/e2e/auth.spec.ts`

Expected: PASS with the page rendering setup-state messaging, the Supabase form keeping magic-link access visible, and the demo fallback button appearing only when requested.

- [ ] **Step 5: Commit**

```bash
git add src/app/(public)/login/page.tsx src/app/(public)/login/page.test.tsx src/features/auth/components/login-form.tsx src/features/auth/components/login-form.test.tsx tests/e2e/auth.spec.ts
git commit -m "feat: restore hosted auth login flow with demo fallback entry"
```

---

### Task 4: Document Hosted Supabase Local Setup

**Files:**
- Modify: `.env.example`
- Create: `docs/local-supabase-hosted-setup.md`
- Modify: `package.json`

- [ ] **Step 1: Write the failing documentation test**

Create a short checklist note in your working session and compare it against the spec. The doc must explicitly include:

```md
- project URL and anon key
- auth redirect URLs
- magic link callback
- invite callback
- schema migration application
- seed loading
- demo fallback flag
```

This step fails if any bullet above is missing from the planned documentation files.

- [ ] **Step 2: Verify the current docs are insufficient**

Run: `Get-Content -Raw .env.example`

Expected: The file does not yet fully explain the hosted Supabase dev setup and fallback flag, so the checklist above is incomplete.

- [ ] **Step 3: Write minimal implementation**

Update `.env.example`:

```env
# Hosted Supabase development project
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Optional local walkthrough fallback
NEXT_PUBLIC_ENABLE_DEMO_MODE=false
```

Create `docs/local-supabase-hosted-setup.md`:

```md
# Hosted Supabase Local Setup

1. Create a Supabase development project.
2. Copy the project URL and anon key into `.env.local`.
3. In Supabase Auth settings, add:
   - `http://localhost:3000`
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/verify-email`
   - `http://localhost:3000/invite`
4. Enable email/password and magic link auth.
5. Apply the SQL in:
   - `supabase/migrations/202605280001_initial_schema.sql`
   - `supabase/migrations/202605280002_rls_policies.sql`
   - `supabase/seed.sql`
6. Optionally set `NEXT_PUBLIC_ENABLE_DEMO_MODE=true` while wiring auth.
7. Start the app with `npm run dev`.
```

If `package.json` somehow lost Supabase packages, ensure these remain present:

```json
"dependencies": {
  "@supabase/ssr": "^0.10.3",
  "@supabase/supabase-js": "^2.108.0"
}
```

- [ ] **Step 4: Verify the docs now cover the setup**

Run: `Get-Content -Raw .env.example`

Expected: PASS by inspection with both Supabase env vars and the demo flag documented.

Run: `Get-Content -Raw docs\\local-supabase-hosted-setup.md`

Expected: PASS by inspection with all required setup bullets present.

- [ ] **Step 5: Commit**

```bash
git add .env.example docs/local-supabase-hosted-setup.md package.json package-lock.json
git commit -m "docs: add hosted supabase local setup guide"
```

---

### Task 5: Full Verification

**Files:**
- Verify only: `src/app/(public)/login/page.tsx`
- Verify only: `src/features/auth/components/login-form.tsx`
- Verify only: `src/lib/auth/session.ts`
- Verify only: `docs/local-supabase-hosted-setup.md`

- [ ] **Step 1: Run focused auth tests**

Run:

```bash
npm.cmd run test -- src/lib/auth/session.test.ts src/app/(public)/login/page.test.tsx src/features/auth/components/login-form.test.tsx tests/e2e/auth.spec.ts
```

Expected: PASS with no failed auth-path tests.

- [ ] **Step 2: Run the full test suite**

Run: `npm.cmd run test`

Expected: PASS with all existing module tests still green.

- [ ] **Step 3: Run the production build**

Run: `npm.cmd run build`

Expected: PASS with the Next.js app compiling successfully and no server-only imports leaking into client bundles.

- [ ] **Step 4: Perform manual smoke verification**

Run: `npm.cmd run dev`

Manual checks:

```md
- Visit `/login` with Supabase env vars present and confirm the password + magic-link form renders.
- If `NEXT_PUBLIC_ENABLE_DEMO_MODE=true`, confirm the secondary "Use demo workspace" button appears.
- Remove the Supabase env vars temporarily and keep demo mode enabled; confirm the role-picker demo screen appears.
- Remove both Supabase env vars and demo mode; confirm the setup-state message renders instead of a runtime crash.
```

- [ ] **Step 5: Commit**

```bash
git add src/app/(public)/login/page.tsx src/features/auth/components/login-form.tsx src/lib/auth/session.ts src/lib/auth/mode.ts src/lib/auth/demo.ts src/app/(public)/login/page.test.tsx src/features/auth/components/login-form.test.tsx src/lib/auth/session.test.ts tests/e2e/auth.spec.ts .env.example docs/local-supabase-hosted-setup.md package.json package-lock.json
git commit -m "feat: switch local auth back to hosted supabase by default"
```

---

## Self-Review

### Spec Coverage

- Hosted Supabase as default path: covered by Tasks 1, 2, and 3.
- Demo fallback behind explicit env flag: covered by Tasks 1 and 3.
- Setup-state UI when config is missing: covered by Task 3.
- Local setup docs and env guidance: covered by Task 4.
- Verification across tests and build: covered by Task 5.

### Placeholder Scan

- No `TODO`, `TBD`, or “implement later” placeholders remain.
- Each task includes exact files, commands, and concrete snippets.

### Type Consistency

- Auth mode values remain `supabase`, `demo`, and `setup`.
- Demo cookie naming is consistent through `DEMO_SESSION_COOKIE`.
- `AppSession` remains the shared contract between demo and Supabase flows.
