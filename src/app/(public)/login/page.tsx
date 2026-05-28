import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

import { LoginForm } from "@/features/auth/components/login-form";
import { getDefaultAuthorizedPath } from "@/lib/auth/guards";
import { getSession } from "@/lib/auth/session";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const errorMessage = resolvedSearchParams?.error;
  const nextPath = resolvedSearchParams?.next;

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const session = await getSession();

    if (session?.role) {
      redirect(getDefaultAuthorizedPath(session.role));
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto grid min-h-screen max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
            MiniERP access
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Sign in to continue your company workspace.
          </h1>
          <p className="max-w-xl text-base leading-7 text-slate-600">
            Password sign-in is ready for returning users, and magic link
            access keeps invite-based onboarding fast for first-time Company
            Admins.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="rounded-full border border-slate-200 bg-white px-4 py-2">
              Invite-based onboarding
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-4 py-2">
              Password and email link access
            </span>
          </div>
          {errorMessage ? (
            <div className="rounded-[28px] border border-rose-200 bg-rose-50/90 p-5 text-sm shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-600">
                Authentication issue
              </p>
              <p className="mt-2 leading-6 text-rose-800">{errorMessage}</p>
            </div>
          ) : null}
          <p className="text-sm text-slate-500">
            Waiting on an invite? Contact your Super Admin or return to{" "}
            <Link className="font-semibold text-blue-600" href="/">
              the MiniERP overview
            </Link>
            .
          </p>
        </div>

        <LoginForm nextPath={nextPath} />
      </section>
    </main>
  );
}
