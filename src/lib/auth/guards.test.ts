import { describe, expect, it } from "vitest";
import {
  getRouteAccessRedirect,
  canAccessRoute,
  buildLoginRedirectPath,
  getDefaultAuthorizedPath,
  isProtectedRoute,
  isPublicRoute,
} from "./guards";
import type { AppSession } from "./session";

function createSession(
  overrides: Partial<AppSession> = {},
): AppSession {
  return {
    user: {
      id: "user-1",
      app_metadata: {},
      user_metadata: {},
      aud: "authenticated",
      created_at: "2026-05-28T00:00:00.000Z",
    },
    profile: null,
    memberships: [
      {
        company_id: "company-1",
        role: "company_admin",
        status: "active",
        joined_at: "2026-05-28T00:00:00.000Z",
      },
    ],
    currentMembership: {
      company_id: "company-1",
      role: "company_admin",
      status: "active",
      joined_at: "2026-05-28T00:00:00.000Z",
    },
    requiresCompanySelection: false,
    companyId: "company-1",
    role: "company_admin",
    isPlatformAdmin: false,
    ...overrides,
  } as AppSession;
}

describe("route guard helpers", () => {
  it("allows company admins into employee routes", () => {
    expect(canAccessRoute("company_admin", "/employees")).toBe(true);
  });

  it("blocks employees from invoice management", () => {
    expect(canAccessRoute("employee", "/invoices")).toBe(false);
  });

  it("matches nested protected routes by their base section", () => {
    expect(canAccessRoute("finance_manager", "/invoices/INV-1001")).toBe(true);
    expect(canAccessRoute("sales_staff", "/customers/new")).toBe(true);
    expect(canAccessRoute("employee", "/reports/monthly")).toBe(false);
  });

  it("distinguishes public and protected route groups", () => {
    expect(isPublicRoute("/login")).toBe(true);
    expect(isPublicRoute("/invite/token-123")).toBe(true);
    expect(isPublicRoute("/verify-email")).toBe(true);
    expect(isPublicRoute("/auth/callback")).toBe(true);

    expect(isProtectedRoute("/dashboard")).toBe(true);
    expect(isProtectedRoute("/employees/abc")).toBe(true);
    expect(isProtectedRoute("/companies")).toBe(true);
  });

  it("returns a sensible default landing path by role", () => {
    expect(getDefaultAuthorizedPath("super_admin")).toBe("/companies");
    expect(getDefaultAuthorizedPath("company_admin")).toBe("/dashboard");
  });

  it("redirects unauthenticated protected-route requests to login", () => {
    expect(getRouteAccessRedirect("/employees", null)).toBe(
      "/login?next=%2Femployees",
    );
  });

  it("preserves query state when building login redirects for deep links", () => {
    expect(buildLoginRedirectPath("/invoices?status=overdue&page=2")).toBe(
      "/login?next=%2Finvoices%3Fstatus%3Doverdue%26page%3D2",
    );
  });

  it("redirects unauthorized authenticated requests to the allowed landing page", () => {
    const employeeSession = createSession({
      memberships: [
        {
          company_id: "company-1",
          role: "employee",
          status: "active",
          joined_at: "2026-05-28T00:00:00.000Z",
        },
      ],
      currentMembership: {
        company_id: "company-1",
        role: "employee",
        status: "active",
        joined_at: "2026-05-28T00:00:00.000Z",
      },
      role: "employee",
    });

    expect(getRouteAccessRedirect("/invoices", employeeSession)).toBe(
      "/dashboard",
    );
  });

  it("keeps signed-in multi-membership users out of login redirects", () => {
    const multiMembershipSession = createSession({
      memberships: [
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
      ],
      currentMembership: null,
      companyId: null,
      role: null,
      requiresCompanySelection: true,
    });

    expect(getRouteAccessRedirect("/employees", multiMembershipSession)).toBe(
      "/dashboard",
    );
  });

  it("allows authorized authenticated access to protected routes", () => {
    expect(getRouteAccessRedirect("/employees", createSession())).toBeNull();
  });
});
