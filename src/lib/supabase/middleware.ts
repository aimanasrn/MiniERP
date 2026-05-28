import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getRouteAccessRedirect } from "../auth/guards";
import { getSession } from "../auth/session";
import type { Database } from "../../types/database";

type ResponseCookieOptions = Parameters<
  ReturnType<typeof NextResponse.next>["cookies"]["set"]
>[2];
type CookieToSet = {
  name: string;
  value: string;
  options?: ResponseCookieOptions;
};

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export async function updateSession(request: NextRequest) {
  const env = getSupabaseEnv();
  const pendingCookies: CookieToSet[] = [];
  let response = NextResponse.next({
    request,
  });

  if (!env) {
    return response;
  }

  const supabase = createServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        pendingCookies.splice(0, pendingCookies.length, ...cookiesToSet);

        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  const requestPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const session = await getSession({
    client: supabase,
    user,
  });
  const redirectPath = getRouteAccessRedirect(requestPath, session);

  if (redirectPath) {
    const redirectUrl = new URL(redirectPath, request.url);
    const redirectResponse = NextResponse.redirect(redirectUrl);

    pendingCookies.forEach(({ name, value, options }) => {
      redirectResponse.cookies.set(name, value, options);
    });

    return redirectResponse;
  }

  return response;
}
