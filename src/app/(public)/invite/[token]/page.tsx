import Link from "next/link";
import React from "react";

import { InviteAcceptForm } from "@/features/auth/components/invite-accept-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database, MembershipRole } from "@/types/database";

type InvitePageProps = {
  params: Promise<{
    token: string;
  }>;
};

type InvitationState =
  | {
      status: "ready";
      companyName: string;
      email: string;
      role: MembershipRole;
      expiresAt: string;
    }
  | {
      status: "missing" | "expired" | "accepted" | "unavailable";
      title: string;
      description: string;
    };

async function loadInvitation(token: string): Promise<InvitationState> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return {
      status: "unavailable",
      title: "Invitation preview is unavailable",
      description:
        "Supabase is not configured in this environment yet, so the invite cannot be verified here.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: invitationRow, error } = await supabase
    .from("company_invitations")
    .select("company_id, email, role, expires_at, accepted_at")
    .eq("token", token)
    .maybeSingle();
  const invitation = invitationRow as Pick<
    Database["public"]["Tables"]["company_invitations"]["Row"],
    "company_id" | "email" | "role" | "expires_at" | "accepted_at"
  > | null;

  if (error) {
    throw error;
  }

  if (!invitation) {
    return {
      status: "missing",
      title: "Invitation not found",
      description:
        "This invite token does not match an active company invitation.",
    };
  }

  if (invitation.accepted_at) {
    return {
      status: "accepted",
      title: "Invitation already used",
      description:
        "This invitation has already been accepted. Sign in to continue.",
    };
  }

  if (new Date(invitation.expires_at).getTime() < Date.now()) {
    return {
      status: "expired",
      title: "Invitation expired",
      description:
        "Ask your Super Admin to send a fresh invite before continuing.",
    };
  }

  const { data: companyRow, error: companyError } = await supabase
    .from("companies")
    .select("name")
    .eq("id", invitation.company_id)
    .maybeSingle();
  const company = companyRow as Pick<
    Database["public"]["Tables"]["companies"]["Row"],
    "name"
  > | null;

  if (companyError) {
    throw companyError;
  }

  return {
    status: "ready",
    companyName: company?.name ?? "your company",
    email: invitation.email,
    role: invitation.role,
    expiresAt: invitation.expires_at,
  };
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const invitation = await loadInvitation(token);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto grid min-h-screen max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
            Company invitation
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Accept your MiniERP access invitation.
          </h1>
          <p className="max-w-xl text-base leading-7 text-slate-600">
            This flow keeps Company Admin onboarding tied to a verified email
            invite before the rest of the ERP opens up.
          </p>
          {invitation.status === "ready" ? (
            <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur">
              <p className="text-sm text-slate-500">Invited company</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {invitation.companyName}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Role:{" "}
                <span className="font-medium text-slate-800">
                  {invitation.role.replaceAll("_", " ")}
                </span>
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Invite expires on{" "}
                <span className="font-medium text-slate-800">
                  {new Date(invitation.expiresAt).toLocaleDateString("en-MY", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                .
              </p>
            </div>
          ) : (
            <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                {invitation.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {invitation.description}
              </p>
              <Link
                className="mt-5 inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
                href="/login"
              >
                Go to login
              </Link>
            </div>
          )}
        </div>

        {invitation.status === "ready" ? (
          <InviteAcceptForm
            companyName={invitation.companyName}
            email={invitation.email}
            role={invitation.role}
            token={token}
          />
        ) : null}
      </section>
    </main>
  );
}
