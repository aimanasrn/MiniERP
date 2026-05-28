import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveAuthCallbackRedirect } from "./route-utils";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const errorMessage =
    requestUrl.searchParams.get("error_description") ??
    requestUrl.searchParams.get("error");
  const next = requestUrl.searchParams.get("next");
  const inviteToken = requestUrl.searchParams.get("invite");
  const loginUrl = new URL("/login", request.url);

  if (next) {
    loginUrl.searchParams.set("next", next);
  }

  if (errorMessage) {
    loginUrl.searchParams.set("error", errorMessage);
    return NextResponse.redirect(loginUrl);
  }

  let supabase;

  try {
    supabase = await createSupabaseServerClient();
  } catch {
    loginUrl.searchParams.set("error", "Supabase is not configured.");
    return NextResponse.redirect(loginUrl);
  }

  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  let authError: Error | null = null;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    authError = error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as Parameters<typeof supabase.auth.verifyOtp>[0]["type"],
    });
    authError = error;
  } else {
    loginUrl.searchParams.set("error", "Missing authentication token.");
    return NextResponse.redirect(loginUrl);
  }

  if (authError) {
    loginUrl.searchParams.set("error", authError.message);
    return NextResponse.redirect(loginUrl);
  }

  const redirectPath = resolveAuthCallbackRedirect({
    inviteToken,
    next,
  });

  return NextResponse.redirect(new URL(redirectPath, request.url));
}
