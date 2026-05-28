"use client";

import React, { useState } from "react";

import { resolveAuthCallbackRedirect } from "@/app/auth/callback/route-utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  validateLoginInput,
  validateMagicLinkInput,
} from "@/lib/validations/auth";

type LoginFormProps = {
  nextPath?: string;
};

export function LoginForm({ nextPath = "/dashboard" }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);

  async function handlePasswordSignIn(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setMessage(null);

    const validated = validateLoginInput({
      email,
      password,
    });

    if (!validated.success) {
      setErrors(validated.errors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword(validated.data);

      if (error) {
        setMessage(error.message);
        return;
      }

      window.location.assign(
        resolveAuthCallbackRedirect({
          next: nextPath,
        }),
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to sign in with password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleMagicLinkRequest() {
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
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("next", nextPath);

      const { error } = await supabase.auth.signInWithOtp({
        email: validated.data.email,
        options: {
          emailRedirectTo: callbackUrl.toString(),
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      const verifyUrl = new URL("/verify-email", window.location.origin);
      verifyUrl.searchParams.set("email", validated.data.email);
      verifyUrl.searchParams.set("mode", "magic-link");
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
      onSubmit={handlePasswordSignIn}
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
          Secure sign in
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          Continue into MiniERP
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          Sign in with your password or request a fresh magic link if you are
          coming back from an invite.
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-800">Work email</span>
        <input
          autoComplete="email"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          value={email}
        />
        {errors.email ? (
          <span className="text-sm text-rose-600">{errors.email}</span>
        ) : null}
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-800">Password</span>
        <input
          autoComplete="current-password"
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
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
        <button
          className="inline-flex justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
          disabled={isSendingMagicLink}
          onClick={handleMagicLinkRequest}
          type="button"
        >
          {isSendingMagicLink ? "Sending..." : "Send magic link"}
        </button>
      </div>
    </form>
  );
}
