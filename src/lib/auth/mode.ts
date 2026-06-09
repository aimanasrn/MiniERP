export type AuthMode = "supabase" | "demo" | "setup";

export function hasSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  return Boolean(url && anonKey);
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
