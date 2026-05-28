"use client";

import React, { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { validateMagicLinkInput } from "@/lib/validations/auth";
import { validateInviteAcceptanceInput } from "@/lib/validations/auth";
import type { MembershipRole } from "@/types/database";

type InviteAcceptFormProps = {
  companyName: string;
  email: string;
  role: MembershipRole;
  token: string;
};

export function InviteAcceptForm({
  companyName,
  email,
  role,
  token,
}: InviteAcceptFormProps) {
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);

  function createCallbackUrl() {
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("invite", token);
    return callbackUrl;
  }

  async function handleCreateAccount(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setMessage(null);

    const validated = validateInviteAcceptanceInput({
      fullName,
      password,
      confirmPassword,
      token,
    });

    if (!validated.success) {
      setErrors(validated.errors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signUp({
        email,
        password: validated.data.password,
        options: {
          data: {
            full_name: validated.data.fullName,
            invitation_token: validated.data.token,
            invited_role: role,
            company_name: companyName,
          },
          emailRedirectTo: createCallbackUrl().toString(),
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      const verifyUrl = new URL("/verify-email", window.location.origin);
      verifyUrl.searchParams.set("email", email);
      verifyUrl.searchParams.set("mode", "invite");
      verifyUrl.searchParams.set("invite", token);
      window.location.assign(verifyUrl.toString());
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to accept invite.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleMagicLink() {
    setMessage(null);

    const validated = validateMagicLinkInput({
      email,
    });

    if (!validated.success) {
      setErrors(validated.errors);
      return;
    }

    setErrors({});
    setIsSendingMagicLink(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: validated.data.email,
        options: {
          emailRedirectTo: createCallbackUrl().toString(),
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      const verifyUrl = new URL("/verify-email", window.location.origin);
      verifyUrl.searchParams.set("email", validated.data.email);
      verifyUrl.searchParams.set("mode", "invite");
      verifyUrl.searchParams.set("invite", token);
      window.location.assign(verifyUrl.toString());
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to send magic link.",
      );
    } finally {
      setIsSendingMagicLink(false);
    }
  }

  return (
    <form
      className="space-y-6 rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur"
      onSubmit={handleCreateAccount}
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
          Invitation accepted
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          Join {companyName}
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          Set up your Company Admin access now, or request a one-tap magic link
          if you prefer not to create a password yet.
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-800">Invited email</span>
        <input
          className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-700"
          disabled
          name="email"
          type="email"
          value={email}
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-800">Full name</span>
        <input
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white"
          name="fullName"
          onChange={(event) => setFullName(event.target.value)}
          value={fullName}
        />
        {errors.fullName ? (
          <span className="text-sm text-rose-600">{errors.fullName}</span>
        ) : null}
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-800">Password</span>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
          {errors.password ? (
            <span className="text-sm text-rose-600">{errors.password}</span>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-800">
            Confirm password
          </span>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white"
            name="confirmPassword"
            onChange={(event) => setConfirmPassword(event.target.value)}
            type="password"
            value={confirmPassword}
          />
          {errors.confirmPassword ? (
            <span className="text-sm text-rose-600">
              {errors.confirmPassword}
            </span>
          ) : null}
        </label>
      </div>

      {message ? (
        <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
          {message}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          className="inline-flex justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Creating..." : "Create account"}
        </button>
        <button
          className="inline-flex justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
          disabled={isSendingMagicLink}
          onClick={handleMagicLink}
          type="button"
        >
          {isSendingMagicLink ? "Sending..." : "Email me a magic link"}
        </button>
      </div>
    </form>
  );
}
