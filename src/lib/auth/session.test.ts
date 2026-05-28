import { describe, expect, it } from "vitest";

import {
  resolveActiveMembershipContext,
  type SessionMembership,
} from "./session";

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
