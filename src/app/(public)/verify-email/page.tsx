import Link from "next/link";
import React from "react";

type VerifyEmailPageProps = {
  searchParams?: Promise<{
    email?: string;
    mode?: string;
    invite?: string;
    verified?: string;
  }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const email = resolvedSearchParams?.email;
  const mode = resolvedSearchParams?.mode;
  const invite = resolvedSearchParams?.invite;
  const isVerified = resolvedSearchParams?.verified === "1";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
        <div className="w-full rounded-[32px] border border-slate-200/70 bg-white/90 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
            Verify email
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            {isVerified ? "Email verified. Keep moving." : "Check your inbox to continue."}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            {isVerified
              ? "Your invitation email has been verified. Continue into sign-in so you can finish the company onboarding flow."
              : mode === "invite"
              ? "We sent the invitation verification email. Open it from the invited inbox to activate the account and return to MiniERP."
              : "We sent a fresh magic link. Open it from your inbox to finish signing in."}
          </p>
          {email ? (
            <p className="mt-5 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
              Sent to <span className="font-semibold">{email}</span>
            </p>
          ) : null}
          {invite ? (
            <p className="mt-4 text-sm leading-6 text-slate-500">
              {isVerified
                ? "Use the same invited email on the next step so the company setup handoff stays connected to this invitation."
                : "Keep the invite email open while you verify so you can finish the onboarding flow without requesting another link."}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
              href={isVerified ? "/login?next=%2Fdashboard" : "/login"}
            >
              {isVerified ? "Continue to sign in" : "Back to login"}
            </Link>
            <Link
              className="inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
              href="/"
            >
              Return home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
