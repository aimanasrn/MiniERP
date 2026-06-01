import { describe, expect, it } from "vitest";

import { APP_NAV_ITEMS } from "../../components/layout/app-navigation";
import {
  canViewNavItem,
  getVisibleNavItems,
} from "./permissions";
import {
  getDashboardSummary,
  type DashboardMetricId,
} from "../../features/dashboard/data/dashboard-service";
import { APP_ROLES } from "./roles";
import {
  canAccessRoute,
  getDefaultAuthorizedPath,
  isProtectedRoute,
} from "../auth/guards";

describe("getVisibleNavItems", () => {
  it("matches the MVP nav metadata against the route-access contract for every role", () => {
    for (const role of APP_ROLES) {
      const expectedItems = APP_NAV_ITEMS.filter((item) =>
        canAccessRoute(role, item.href),
      ).map((item) => item.href);

      expect(getVisibleNavItems(role)).toEqual(expectedItems);
    }
  });

  it("does not advertise navigation before a role is resolved", () => {
    expect(getVisibleNavItems(null)).toEqual([]);
  });

  it("keeps the super-admin fallback route representable in the sidebar", () => {
    const defaultPath = getDefaultAuthorizedPath("super_admin");

    expect(defaultPath).toBe("/companies");
    expect(getVisibleNavItems("super_admin")).toContain(defaultPath);
    expect(canViewNavItem("super_admin", defaultPath)).toBe(true);
    expect(isProtectedRoute(defaultPath)).toBe(true);
  });

  it("hides inaccessible routes consistently with the route guard helper", () => {
    expect(canViewNavItem("employee", "/expenses")).toBe(false);
    expect(canViewNavItem("finance_manager", "/accounting")).toBe(true);
    expect(canViewNavItem("inventory_manager", "/procurement")).toBe(true);
  });
});

describe("getDashboardSummary", () => {
  it("shows finance metrics for finance managers", async () => {
    const summary = await getDashboardSummary("finance_manager");

    expect(summary.metrics.map((metric) => metric.id)).toEqual<
      DashboardMetricId[]
    >(["invoice_total", "expense_total"]);
    expect(summary.highlights).toContain("Keep receivables and spend aligned.");
  });

  it("gives employees a focused dashboard summary", async () => {
    const summary = await getDashboardSummary("employee");

    expect(summary.metrics.map((metric) => metric.id)).toEqual<
      DashboardMetricId[]
    >(["employee_count"]);
    expect(summary.title).toBe("Personal workspace");
  });

  it("rejects role-less access instead of inventing employee dashboard access", async () => {
    await expect(getDashboardSummary(null)).rejects.toThrow(
      "Dashboard summary requires an authorized role.",
    );
  });
});
