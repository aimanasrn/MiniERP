import { describe, expect, expectTypeOf, it } from "vitest";
import {
  databaseTableNames,
  numericColumnStrategy,
  rlsCapabilities,
  type Database,
} from "./database";

describe("Database types", () => {
  it("includes the core tenancy and mvp business tables", () => {
    type PublicTables = keyof Database["public"]["Tables"];

    expectTypeOf<PublicTables>().toMatchTypeOf<
      | "companies"
      | "company_invitations"
      | "company_memberships"
      | "profiles"
      | "employees"
      | "products"
      | "customers"
      | "invoices"
      | "invoice_items"
      | "expenses"
    >();

    expect(databaseTableNames).toEqual([
      "profiles",
      "companies",
      "company_memberships",
      "company_invitations",
      "employees",
      "products",
      "customers",
      "invoices",
      "invoice_items",
      "expenses",
    ]);
  });

  it("tracks platform super admin company-management access", () => {
    expect(rlsCapabilities.platformAdminRoleSource).toBe("jwt_app_metadata");
    expect(rlsCapabilities.companies.platformSuperAdminCanInsert).toBe(true);
    expect(
      rlsCapabilities.companies.platformSuperAdminCanReadWithoutMembership,
    ).toBe(true);
    expect(
      rlsCapabilities.companyMemberships.platformSuperAdminCanManageWithoutMembership,
    ).toBe(true);
    expect(
      rlsCapabilities.companyInvitations.platformSuperAdminCanManageWithoutMembership,
    ).toBe(true);
    expect(
      rlsCapabilities.companyMemberships.tenantAdminsCanAssignSuperAdminRole,
    ).toBe(false);
    expect(
      rlsCapabilities.companyInvitations.tenantAdminsCanInviteSuperAdminRole,
    ).toBe(false);

    type Functions = Database["public"]["Functions"];
    expectTypeOf<Functions>().toHaveProperty("is_tenant_manageable_role");
  });

  it("models monetary numeric columns as strings", () => {
    type ProductRow = Database["public"]["Tables"]["products"]["Row"];
    type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];
    type InvoiceItemRow = Database["public"]["Tables"]["invoice_items"]["Row"];
    type ExpenseRow = Database["public"]["Tables"]["expenses"]["Row"];

    expect(numericColumnStrategy.source).toBe("supabase_generated_types");
    expect(numericColumnStrategy.monetaryColumnsUseString).toBe(true);

    expectTypeOf<ProductRow["unit_price"]>().toEqualTypeOf<string>();
    expectTypeOf<InvoiceRow["subtotal"]>().toEqualTypeOf<string>();
    expectTypeOf<InvoiceRow["tax_amount"]>().toEqualTypeOf<string>();
    expectTypeOf<InvoiceRow["total_amount"]>().toEqualTypeOf<string>();
    expectTypeOf<InvoiceItemRow["quantity"]>().toEqualTypeOf<string>();
    expectTypeOf<InvoiceItemRow["unit_price"]>().toEqualTypeOf<string>();
    expectTypeOf<InvoiceItemRow["line_total"]>().toEqualTypeOf<string>();
    expectTypeOf<ExpenseRow["amount"]>().toEqualTypeOf<string>();
  });
});
