import type { MembershipRole } from "../../types/database";

export const APP_ROLES = [
  "super_admin",
  "company_admin",
  "hr_manager",
  "finance_manager",
  "inventory_manager",
  "sales_staff",
  "employee",
] as const satisfies readonly MembershipRole[];

export const ROLE_LABELS: Record<MembershipRole, string> = {
  super_admin: "Super Admin",
  company_admin: "Company Admin",
  hr_manager: "HR Manager",
  finance_manager: "Finance Manager",
  inventory_manager: "Inventory Manager",
  sales_staff: "Sales Staff",
  employee: "Employee",
};

export function getRoleLabel(role: MembershipRole | null) {
  if (!role) {
    return "Role pending";
  }

  return ROLE_LABELS[role];
}
