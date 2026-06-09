import type { User } from "@supabase/supabase-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sessionTestDoubles = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
  createSupabaseServerClientMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: sessionTestDoubles.cookiesMock,
}));

vi.mock("../supabase/server", () => ({
  createSupabaseServerClient: sessionTestDoubles.createSupabaseServerClientMock,
}));

import {
  DEMO_COMPANY_ID,
  DEMO_JOINED_AT,
  DEMO_SESSION_COOKIE,
  isDemoRole,
} from "./demo";
import { getAuthMode, hasSupabaseEnv, isDemoModeEnabled } from "./mode";

import {
  getDemoSession,
  getSession,
  type SessionProfile,
  resolveActiveMembershipContext,
  type SessionMembership,
} from "./session";

function createSupabaseUser(overrides?: Partial<User>): User {
  return {
    id: "user-1",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: "2026-05-01T00:00:00.000Z",
    ...overrides,
  } as User;
}

function createSessionProfile(overrides?: Partial<SessionProfile>): SessionProfile {
  return {
    id: "user-1",
    email: "admin@northwind.test",
    full_name: "Alex Admin",
    avatar_url: null,
    status: "active",
    ...overrides,
  };
}

function createSessionMembership(overrides?: Partial<SessionMembership>): SessionMembership {
  return {
    company_id: "company-1",
    role: "company_admin",
    status: "active",
    joined_at: "2026-05-28T00:00:00.000Z",
    ...overrides,
  };
}

function createSupabaseClientDouble(options?: {
  authUser?: User | null;
  authError?: Error | null;
  profileData?: SessionProfile | null;
  profileError?: Error | null;
  membershipsData?: SessionMembership[] | null;
  membershipsError?: Error | null;
}) {
  const profileQuery = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({
      data: options?.profileData ?? null,
      error: options?.profileError ?? null,
    }),
  };
  const membershipQuery = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({
      data: options?.membershipsData ?? [],
      error: options?.membershipsError ?? null,
    }),
  };

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user:
            options && "authUser" in options ? options.authUser : createSupabaseUser(),
        },
        error: options?.authError ?? null,
      }),
    },
    from: vi.fn((table: string) => {
      if (table === "profiles") {
        return profileQuery;
      }

      if (table === "company_memberships") {
        return membershipQuery;
      }

      throw new Error(`Unexpected table: ${table}`);
    }),
    profileQuery,
    membershipQuery,
  };
}

describe("resolveActiveMembershipContext", () => {
  it("uses the single active membership as the current company context", () => {
    const memberships: SessionMembership[] = [
      {
        company_id: "company-1",
        role: "company_admin",
        status: "active",
        joined_at: "2026-05-28T00:00:00.000Z",
      },
    ];

    expect(resolveActiveMembershipContext(memberships)).toEqual({
      memberships,
      currentMembership: memberships[0],
      companyId: "company-1",
      role: "company_admin",
      requiresCompanySelection: false,
    });
  });

  it("avoids silently choosing a tenant context when multiple active memberships exist", () => {
    const memberships: SessionMembership[] = [
      {
        company_id: "company-1",
        role: "company_admin",
        status: "active",
        joined_at: "2026-05-28T00:00:00.000Z",
      },
      {
        company_id: "company-2",
        role: "finance_manager",
        status: "active",
        joined_at: "2026-05-29T00:00:00.000Z",
      },
    ];

    expect(resolveActiveMembershipContext(memberships)).toEqual({
      memberships,
      currentMembership: null,
      companyId: null,
      role: null,
      requiresCompanySelection: true,
    });
  });
});

describe("getDemoSession", () => {
  it("uses the stable demo cookie name", () => {
    expect(DEMO_SESSION_COOKIE).toBe("minierp-demo-role");
  });

  it("accepts every membership role and rejects invalid values", () => {
    expect(isDemoRole("super_admin")).toBe(true);
    expect(isDemoRole("company_admin")).toBe(true);
    expect(isDemoRole("hr_manager")).toBe(true);
    expect(isDemoRole("finance_manager")).toBe(true);
    expect(isDemoRole("inventory_manager")).toBe(true);
    expect(isDemoRole("sales_staff")).toBe(true);
    expect(isDemoRole("employee")).toBe(true);

    expect(isDemoRole("owner")).toBe(false);
    expect(isDemoRole("finance-manager")).toBe(false);
    expect(isDemoRole(null)).toBe(false);
  });

  it("builds a local demo session for the selected role", () => {
    const session = getDemoSession("finance_manager");

    expect(session.role).toBe("finance_manager");
    expect(session.companyId).toBe(DEMO_COMPANY_ID);
    expect(session.profile?.email).toBe("finance.manager@demo.minierp.local");
    expect(session.profile?.full_name).toBe("Finance Manager");
    expect(session.user.id).toBe("demo-finance_manager");
    expect(session.user.created_at).toBe(DEMO_JOINED_AT);
    expect(session.currentMembership).toEqual({
      company_id: DEMO_COMPANY_ID,
      role: "finance_manager",
      status: "active",
      joined_at: DEMO_JOINED_AT,
    });
  });
});

describe("auth mode helpers", () => {
  it("treats whitespace-only Supabase env values as missing", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "   ");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "\t");
    vi.stubEnv("NEXT_PUBLIC_ENABLE_DEMO_MODE", "true");

    expect(hasSupabaseEnv()).toBe(false);
    expect(getAuthMode()).toBe("demo");
  });

  it("prefers supabase, then demo, then setup", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://demo.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.stubEnv("NEXT_PUBLIC_ENABLE_DEMO_MODE", "false");

    expect(hasSupabaseEnv()).toBe(true);
    expect(isDemoModeEnabled()).toBe(false);
    expect(getAuthMode()).toBe("supabase");

    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_ENABLE_DEMO_MODE", "true");

    expect(hasSupabaseEnv()).toBe(false);
    expect(isDemoModeEnabled()).toBe(true);
    expect(getAuthMode()).toBe("demo");

    vi.stubEnv("NEXT_PUBLIC_ENABLE_DEMO_MODE", "false");

    expect(isDemoModeEnabled()).toBe(false);
    expect(getAuthMode()).toBe("setup");
  });
});

describe("getSession", () => {
  beforeEach(() => {
    sessionTestDoubles.cookiesMock.mockReset();
    sessionTestDoubles.createSupabaseServerClientMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns null in setup mode without initializing Supabase", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_ENABLE_DEMO_MODE", "false");

    sessionTestDoubles.createSupabaseServerClientMock.mockRejectedValue(
      new Error("should not initialize supabase"),
    );

    await expect(getSession()).resolves.toBeNull();

    expect(sessionTestDoubles.cookiesMock).not.toHaveBeenCalled();
    expect(
      sessionTestDoubles.createSupabaseServerClientMock,
    ).not.toHaveBeenCalled();
  });

  it("builds a demo session from the selected demo cookie without initializing Supabase", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_ENABLE_DEMO_MODE", "true");

    sessionTestDoubles.cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "finance_manager" }),
    });

    await expect(getSession()).resolves.toMatchObject({
      companyId: DEMO_COMPANY_ID,
      role: "finance_manager",
      profile: {
        email: "finance.manager@demo.minierp.local",
      },
    });

    expect(sessionTestDoubles.cookiesMock).toHaveBeenCalledTimes(1);
    expect(
      sessionTestDoubles.createSupabaseServerClientMock,
    ).not.toHaveBeenCalled();
  });

  it("returns null for an invalid demo cookie without initializing Supabase", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_ENABLE_DEMO_MODE", "true");

    sessionTestDoubles.cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "owner" }),
    });

    await expect(getSession()).resolves.toBeNull();

    expect(sessionTestDoubles.cookiesMock).toHaveBeenCalledTimes(1);
    expect(
      sessionTestDoubles.createSupabaseServerClientMock,
    ).not.toHaveBeenCalled();
  });

  it("returns null when Supabase has no authenticated user", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://demo.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.stubEnv("NEXT_PUBLIC_ENABLE_DEMO_MODE", "false");

    const client = createSupabaseClientDouble({
      authUser: null,
    });

    await expect(getSession({ client: client as never })).resolves.toBeNull();

    expect(client.auth.getUser).toHaveBeenCalledTimes(1);
    expect(client.from).not.toHaveBeenCalled();
    expect(sessionTestDoubles.cookiesMock).not.toHaveBeenCalled();
  });

  it("throws when the Supabase profile query fails", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://demo.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.stubEnv("NEXT_PUBLIC_ENABLE_DEMO_MODE", "false");

    const profileError = new Error("profile query failed");
    const client = createSupabaseClientDouble({
      profileError,
      membershipsData: [createSessionMembership()],
    });

    await expect(getSession({ client: client as never })).rejects.toBe(profileError);

    expect(client.auth.getUser).toHaveBeenCalledTimes(1);
    expect(client.from).toHaveBeenCalledWith("profiles");
    expect(client.from).toHaveBeenCalledWith("company_memberships");
  });

  it("throws when auth.getUser fails in the Supabase path", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://demo.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.stubEnv("NEXT_PUBLIC_ENABLE_DEMO_MODE", "false");

    const authError = new Error("auth failed");
    const client = createSupabaseClientDouble({
      authError,
    });

    await expect(getSession({ client: client as never })).rejects.toBe(authError);

    expect(client.auth.getUser).toHaveBeenCalledTimes(1);
    expect(client.from).not.toHaveBeenCalled();
  });

  it("returns null when auth.getUser reports a missing auth session", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://demo.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.stubEnv("NEXT_PUBLIC_ENABLE_DEMO_MODE", "false");

    const authError = new Error("Auth session missing!");
    authError.name = "AuthSessionMissingError";

    const client = createSupabaseClientDouble({
      authUser: null,
      authError,
    });

    await expect(getSession({ client: client as never })).resolves.toBeNull();

    expect(client.auth.getUser).toHaveBeenCalledTimes(1);
    expect(client.from).not.toHaveBeenCalled();
  });

  it("throws when the Supabase membership query fails", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://demo.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.stubEnv("NEXT_PUBLIC_ENABLE_DEMO_MODE", "false");

    const membershipError = new Error("membership query failed");
    const client = createSupabaseClientDouble({
      profileData: createSessionProfile(),
      membershipsError: membershipError,
    });

    await expect(getSession({ client: client as never })).rejects.toBe(
      membershipError,
    );

    expect(client.auth.getUser).toHaveBeenCalledTimes(1);
    expect(client.from).toHaveBeenCalledWith("profiles");
    expect(client.from).toHaveBeenCalledWith("company_memberships");
  });

  it("resolves the single active membership for a Supabase session", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://demo.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.stubEnv("NEXT_PUBLIC_ENABLE_DEMO_MODE", "false");

    const membership = createSessionMembership({
      company_id: "company-42",
      role: "finance_manager",
    });
    const profile = createSessionProfile({
      id: "user-42",
      email: "finance@northwind.test",
      full_name: "Fin Manager",
    });
    const client = createSupabaseClientDouble({
      authUser: createSupabaseUser({ id: "user-42" }),
      profileData: profile,
      membershipsData: [membership],
    });

    await expect(getSession({ client: client as never })).resolves.toEqual({
      user: expect.objectContaining({ id: "user-42" }),
      profile,
      memberships: [membership],
      currentMembership: membership,
      companyId: "company-42",
      role: "finance_manager",
      isPlatformAdmin: false,
      requiresCompanySelection: false,
    });
  });

  it("overrides the active role for platform admins in the Supabase path", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://demo.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.stubEnv("NEXT_PUBLIC_ENABLE_DEMO_MODE", "false");

    const membership = createSessionMembership({
      role: "employee",
    });
    const client = createSupabaseClientDouble({
      authUser: createSupabaseUser({
        app_metadata: {
          role: "super_admin",
          roles: ["super_admin"],
        },
      }),
      profileData: createSessionProfile(),
      membershipsData: [membership],
    });

    await expect(getSession({ client: client as never })).resolves.toMatchObject({
      role: "super_admin",
      isPlatformAdmin: true,
      currentMembership: membership,
    });
  });

  it("uses options.user without calling auth.getUser", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://demo.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.stubEnv("NEXT_PUBLIC_ENABLE_DEMO_MODE", "false");

    const user = createSupabaseUser({ id: "user-fast-path" });
    const membership = createSessionMembership({
      company_id: "company-fast",
      role: "sales_staff",
    });
    const profile = createSessionProfile({
      id: "user-fast-path",
      email: "sales@northwind.test",
    });
    const client = createSupabaseClientDouble({
      profileData: profile,
      membershipsData: [membership],
    });

    await expect(
      getSession({ client: client as never, user }),
    ).resolves.toMatchObject({
      user: expect.objectContaining({ id: "user-fast-path" }),
      profile,
      currentMembership: membership,
      companyId: "company-fast",
      role: "sales_staff",
    });

    expect(client.auth.getUser).not.toHaveBeenCalled();
  });
});
