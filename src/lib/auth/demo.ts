import type { MembershipRole } from "@/types/database";

export const DEMO_SESSION_COOKIE = "minierp-demo-role";
export const DEMO_COMPANY_ID = "demo-company";
export const DEMO_JOINED_AT = "2026-01-01T00:00:00.000Z";

export function isDemoRole(value: unknown): value is MembershipRole {
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
