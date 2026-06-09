import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import type { AppSupabaseClient } from "../supabase/server";
import { createSupabaseServerClient } from "../supabase/server";
import type { MembershipRole, ProfileStatus } from "../../types/database";
import {
  DEMO_COMPANY_ID,
  DEMO_JOINED_AT,
  DEMO_SESSION_COOKIE,
  isDemoRole,
} from "./demo";
import { getAuthMode } from "./mode";

export type SessionProfile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  status: ProfileStatus;
};

export type SessionMembership = {
  company_id: string;
  role: MembershipRole;
  status: "active";
  joined_at: string | null;
};

export type MembershipContext = {
  memberships: SessionMembership[];
  currentMembership: SessionMembership | null;
  companyId: string | null;
  role: MembershipRole | null;
  requiresCompanySelection: boolean;
};

export type AppSession = {
  user: User;
  profile: SessionProfile | null;
  memberships: SessionMembership[];
  currentMembership: SessionMembership | null;
  companyId: string | null;
  role: MembershipRole | null;
  isPlatformAdmin: boolean;
  requiresCompanySelection: boolean;
};

function isPlatformAdmin(user: User) {
  const role = user.app_metadata?.role;
  const roles = user.app_metadata?.roles;

  return (
    role === "super_admin" ||
    (Array.isArray(roles) && roles.includes("super_admin"))
  );
}

export function getDemoSession(role: MembershipRole): AppSession {
  const emailLocalPart = role.replaceAll("_", ".");
  const user = {
    id: `demo-${role}`,
    app_metadata: {
      role,
      roles: [role],
    },
    user_metadata: {},
    aud: "authenticated",
    created_at: DEMO_JOINED_AT,
  } as User;
  const membership: SessionMembership = {
    company_id: DEMO_COMPANY_ID,
    role,
    status: "active",
    joined_at: DEMO_JOINED_AT,
  };

  return {
    user,
    profile: {
      id: user.id,
      email: `${emailLocalPart}@demo.minierp.local`,
      full_name: role
        .split("_")
        .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
        .join(" "),
      avatar_url: null,
      status: "active" satisfies ProfileStatus,
    },
    memberships: [membership],
    currentMembership: membership,
    companyId: DEMO_COMPANY_ID,
    role,
    isPlatformAdmin: role === "super_admin",
    requiresCompanySelection: false,
  };
}

function isMissingAuthSessionError(error: unknown) {
  return error instanceof Error && error.name === "AuthSessionMissingError";
}

export function resolveActiveMembershipContext(
  memberships: SessionMembership[],
): MembershipContext {
  if (memberships.length === 1) {
    const currentMembership = memberships[0];

    return {
      memberships,
      currentMembership,
      companyId: currentMembership.company_id,
      role: currentMembership.role,
      requiresCompanySelection: false,
    };
  }

  return {
    memberships,
    currentMembership: null,
    companyId: null,
    role: null,
    requiresCompanySelection: memberships.length > 1,
  };
}

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

  if (user === null) {
    const {
      data: { user: authUser },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      if (isMissingAuthSessionError(userError)) {
        return null;
      }

      throw userError;
    }

    user = authUser;
  }

  if (!user) {
    return null;
  }

  const [{ data: profile, error: profileError }, { data: memberships, error: membershipError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url, status")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("company_memberships")
        .select("company_id, role, status, joined_at")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("joined_at", { ascending: true }),
    ]);

  if (profileError) {
    throw profileError;
  }

  if (membershipError) {
    throw membershipError;
  }

  const activeMemberships = (memberships ?? []) as SessionMembership[];
  const membershipContext = resolveActiveMembershipContext(activeMemberships);
  const platformAdmin = isPlatformAdmin(user);
  const role = platformAdmin ? "super_admin" : membershipContext.role;

  return {
    user,
    profile,
    memberships: membershipContext.memberships,
    currentMembership: membershipContext.currentMembership,
    companyId: membershipContext.companyId,
    role,
    isPlatformAdmin: platformAdmin,
    requiresCompanySelection: !platformAdmin && membershipContext.requiresCompanySelection,
  };
}
