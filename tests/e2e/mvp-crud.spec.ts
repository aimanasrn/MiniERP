import React from "react";
import { render, screen } from "@testing-library/react";

import CompanyPage from "@/app/(app)/company/page";
import DashboardPage from "@/app/(app)/dashboard/page";
import AccountingPage from "@/app/(app)/accounting/page";
import PayrollPage from "@/app/(app)/payroll/page";
import ProcurementPage from "@/app/(app)/procurement/page";
import CompaniesPage from "@/app/(platform)/companies/page";

const { requireRouteAccessMock } = vi.hoisted(() => ({
  requireRouteAccessMock: vi.fn(),
}));

vi.mock("@/lib/auth/guards", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth/guards")>(
    "@/lib/auth/guards",
  );

  return {
    ...actual,
    requireRouteAccess: requireRouteAccessMock,
  };
});

describe("mvp shell smoke", () => {
  beforeEach(() => {
    requireRouteAccessMock.mockReset();
  });

  it("dashboard shows ERP module navigation for company admins", async () => {
    requireRouteAccessMock.mockResolvedValue({
      role: "company_admin",
    });

    render(await DashboardPage());

    expect(screen.getByText(/^inventory$/i)).toBeInTheDocument();
    expect(screen.getByText(/^payroll$/i)).toBeInTheDocument();
    expect(screen.getByText(/^accounting$/i)).toBeInTheDocument();
    expect(screen.getByText(/^procurement$/i)).toBeInTheDocument();
  });

  it("renders the company workspace and planned module placeholders", async () => {
    requireRouteAccessMock.mockResolvedValue({
      role: "company_admin",
    });

    const [companyPage, payrollPage, accountingPage, procurementPage] =
      await Promise.all([
        CompanyPage(),
        PayrollPage(),
        AccountingPage(),
        ProcurementPage(),
      ]);

    render(
      React.createElement(
        "div",
        null,
        companyPage,
        payrollPage,
        accountingPage,
        procurementPage,
      ),
    );

    expect(
      screen.getByRole("heading", { name: /company profile workspace/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { name: /^payroll$/i })).toHaveLength(2);
    expect(screen.getAllByRole("heading", { name: /^accounting$/i })).toHaveLength(2);
    expect(
      screen.getAllByRole("heading", { name: /^procurement$/i }),
    ).toHaveLength(2);
    expect(screen.getAllByText(/planned module/i)).toHaveLength(3);
  });

  it("renders the platform companies entry for super admins", async () => {
    requireRouteAccessMock.mockResolvedValue({
      role: "super_admin",
    });

    render(await CompaniesPage());

    expect(
      screen.getByRole("heading", { name: /platform company registry/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /invite the first company admin before deeper tenant operations begin/i,
      }),
    ).toBeInTheDocument();
  });
});
