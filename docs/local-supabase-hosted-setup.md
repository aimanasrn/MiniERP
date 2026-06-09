# Hosted Supabase Local Setup

Use a separate Supabase development project for local auth work so you can test email/password, magic links, and invites without touching production.

## 1. Create a Supabase development project

Create a new project in the Supabase dashboard for local MiniERP development. A small shared dev project is fine as long as it is not production.

## 2. Copy the project URL and anon key

In the Supabase dashboard, open `Project Settings -> Data API` and copy:

- `Project URL`
- `anon` / publishable key

Add them to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_ENABLE_DEMO_MODE=false
```

Set `NEXT_PUBLIC_ENABLE_DEMO_MODE=true` only if you want the extra local demo fallback button to appear alongside the hosted sign-in form.

## 3. Configure local auth URLs

In `Authentication -> URL Configuration`, use:

- Site URL: `http://localhost:3000`
- Redirect URL: `http://localhost:3000/auth/callback`

Add local development redirect URLs that cover the current flows:

- `http://localhost:3000/auth/callback`
- `http://localhost:3000/verify-email`
- `http://localhost:3000/invite`

The app sends both normal magic-link sign-in and invite acceptance back through `/auth/callback`. The `/invite` route is the local invite entry page, and `/verify-email` is the local confirmation screen shown after sending a link.

## 4. Enable the auth providers used by the app

In `Authentication -> Providers -> Email`, enable:

- Email/password sign-ins
- Magic link sign-ins

## 5. Apply the existing schema and seed SQL

Run the existing SQL against the hosted development database in this order:

1. `supabase/migrations/202605280001_initial_schema.sql`
2. `supabase/migrations/202605280002_rls_policies.sql`
3. `supabase/seed.sql`

You can paste each file into the Supabase SQL Editor, or apply them with your usual Supabase workflow if you already have one configured.

## 6. Choose whether demo fallback stays on

- Use `NEXT_PUBLIC_ENABLE_DEMO_MODE=false` to keep hosted Supabase auth as the only local sign-in path.
- Use `NEXT_PUBLIC_ENABLE_DEMO_MODE=true` to keep the hosted sign-in form primary while also exposing the local demo workspace fallback.
- Remove the Supabase env vars and set `NEXT_PUBLIC_ENABLE_DEMO_MODE=true` if you want to work only in demo mode temporarily.

## 7. Start the app

Run:

```bash
npm run dev
```

Then open `http://localhost:3000/login` and confirm the hosted Supabase sign-in form appears.
