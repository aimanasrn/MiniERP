import type { User } from "@supabase/supabase-js";

import type { AppSupabaseClient } from "../supabase/server";
import { createSupabaseServerClient } from "../supabase/server";
import type { MembershipRole, ProfileStatus } from "../../types/database";

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
  membership: SessionMembership | null;
  companyId: string | null;
  role: MembershipRole | null;
  isPlatformAdmin: boolean;
  requiresCompanySelection: boolean;
};

function isMembershipRole(value: unknown): value is MembershipRole {
  return (
    value === "super_admin" ||
    value === "company_admin" ||
    value === "hr_manager" ||
    value === "finance_manager" ||
    value === "inventory_manager" ||
    value === "sales_staff" ||
    value === "employee"
  );
}

function isPlatformAdmin(user: User) {
  const role = user.app_metadata?.role;
  const roles = user.app_metadata?.roles;

  return (
    role === "super_admin" ||
    (Array.isArray(roles) && roles.includes("super_admin"))
  );
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
      role: isMembershipRole(currentMembership.role)
        ? currentMembership.role
        : null,
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
  const supabase = options?.client ?? (await createSupabaseServerClient());
  let user = options?.user ?? null;

  if (user === null) {
    const {
      data: { user: authUser },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
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
    membership: membershipContext.currentMembership,
    companyId: membershipContext.companyId,
    role,
    isPlatformAdmin: platformAdmin,
    requiresCompanySelection: !platformAdmin && membershipContext.requiresCompanySelection,
  };
}
