import { redirect } from "next/navigation";

import { getSession, type AppSession } from "./session";
import type { MembershipRole } from "../../types/database";

const PUBLIC_ROUTE_PREFIXES = [
  "/",
  "/login",
  "/invite",
  "/verify-email",
  "/auth/callback",
] as const;

const PROTECTED_ROUTE_PERMISSIONS: Record<string, readonly MembershipRole[]> = {
  "/dashboard": [
    "super_admin",
    "company_admin",
    "hr_manager",
    "finance_manager",
    "inventory_manager",
    "sales_staff",
    "employee",
  ],
  "/company": ["super_admin", "company_admin"],
  "/employees": ["super_admin", "company_admin", "hr_manager"],
  "/inventory": ["super_admin", "company_admin", "inventory_manager"],
  "/customers": ["super_admin", "company_admin", "sales_staff"],
  "/invoices": [
    "super_admin",
    "company_admin",
    "finance_manager",
    "sales_staff",
  ],
  "/expenses": ["super_admin", "company_admin", "finance_manager"],
  "/reports": [
    "super_admin",
    "company_admin",
    "hr_manager",
    "finance_manager",
    "inventory_manager",
  ],
  "/payroll": ["super_admin", "company_admin"],
  "/accounting": ["super_admin", "company_admin", "finance_manager"],
  "/procurement": ["super_admin", "company_admin", "inventory_manager"],
  "/companies": ["super_admin"],
} as const;

function normalizePathname(pathname: string) {
  if (!pathname || pathname === "/") {
    return "/";
  }

  const trimmed = pathname.trim();
  const withoutQuery = trimmed.split("?")[0]?.split("#")[0] ?? "/";
  const normalized = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;

  return normalized.length > 1 ? normalized.replace(/\/+$/, "") : normalized;
}

function normalizeRequestPath(pathname: string) {
  if (!pathname) {
    return "/";
  }

  const trimmed = pathname.trim();
  const [rawPathname = "/", rawSearch = ""] = trimmed.split("?", 2);
  const normalizedPathname = normalizePathname(rawPathname);

  if (!rawSearch) {
    return normalizedPathname;
  }

  return `${normalizedPathname}?${rawSearch}`;
}

function matchesRoutePrefix(pathname: string, routePrefix: string) {
  return pathname === routePrefix || pathname.startsWith(`${routePrefix}/`);
}

function resolveProtectedRoute(pathname: string) {
  const normalizedPath = normalizePathname(pathname);

  return Object.keys(PROTECTED_ROUTE_PERMISSIONS)
    .sort((left, right) => right.length - left.length)
    .find((routePrefix) => matchesRoutePrefix(normalizedPath, routePrefix));
}

export function isPublicRoute(pathname: string) {
  const normalizedPath = normalizePathname(pathname);

  if (normalizedPath === "/") {
    return true;
  }

  return PUBLIC_ROUTE_PREFIXES.some((routePrefix) => {
    if (routePrefix === "/") {
      return false;
    }

    return matchesRoutePrefix(normalizedPath, routePrefix);
  });
}

export function isProtectedRoute(pathname: string) {
  return resolveProtectedRoute(pathname) !== undefined;
}

export function canAccessRoute(role: MembershipRole, pathname: string) {
  const matchedRoute = resolveProtectedRoute(pathname);

  if (!matchedRoute) {
    return false;
  }

  return PROTECTED_ROUTE_PERMISSIONS[matchedRoute].includes(role);
}

export function getDefaultAuthorizedPath(role: MembershipRole) {
  return role === "super_admin" ? "/companies" : "/dashboard";
}

export function buildLoginRedirectPath(pathname: string) {
  const normalizedPath = normalizeRequestPath(pathname);

  if (normalizedPath === "/") {
    return "/login";
  }

  return `/login?next=${encodeURIComponent(normalizedPath)}`;
}

export function getRouteAccessRedirect(
  pathname: string,
  session: AppSession | null,
) {
  if (!isProtectedRoute(pathname)) {
    return null;
  }

  if (!session) {
    return buildLoginRedirectPath(pathname);
  }

  if (session.requiresCompanySelection) {
    return "/dashboard";
  }

  if (!session.role) {
    return "/login";
  }

  if (!canAccessRoute(session.role, pathname)) {
    return getDefaultAuthorizedPath(session.role);
  }

  return null;
}

export async function requireAuthenticatedSession() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireRouteAccess(
  pathname: string,
  existingSession?: AppSession | null,
) {
  const session = existingSession ?? (await getSession());
  const redirectPath = getRouteAccessRedirect(pathname, session);

  if (redirectPath) {
    redirect(redirectPath);
  }

  return session;
}
