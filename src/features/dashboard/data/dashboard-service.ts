import type { MembershipRole } from "../../../types/database";

export type DashboardMetricId =
  | "employee_count"
  | "low_stock_count"
  | "invoice_total"
  | "expense_total";

export type DashboardMetric = {
  id: DashboardMetricId;
  label: string;
  value: string;
  change: string;
  detail: string;
};

export type DashboardSummary = {
  title: string;
  description: string;
  highlights: string[];
  metrics: DashboardMetric[];
};

const DASHBOARD_METRICS: Record<DashboardMetricId, DashboardMetric> = {
  employee_count: {
    id: "employee_count",
    label: "Employees",
    value: "0",
    change: "Roster ready for onboarding",
    detail: "Headcount widgets will connect to live employee records next.",
  },
  low_stock_count: {
    id: "low_stock_count",
    label: "Low-stock products",
    value: "0",
    change: "No urgent replenishment alerts",
    detail: "Inventory thresholds will surface here once product flows land.",
  },
  invoice_total: {
    id: "invoice_total",
    label: "Invoice pipeline",
    value: "$0",
    change: "No open receivables yet",
    detail: "Sales and finance can use this to track invoice momentum.",
  },
  expense_total: {
    id: "expense_total",
    label: "Expenses tracked",
    value: "$0",
    change: "No spend submitted yet",
    detail: "Expense intake will roll into this summary when approvals arrive.",
  },
};

const METRICS_BY_ROLE: Record<MembershipRole, readonly DashboardMetricId[]> = {
  super_admin: [
    "employee_count",
    "low_stock_count",
    "invoice_total",
    "expense_total",
  ],
  company_admin: [
    "employee_count",
    "low_stock_count",
    "invoice_total",
    "expense_total",
  ],
  hr_manager: ["employee_count"],
  finance_manager: ["invoice_total", "expense_total"],
  inventory_manager: ["low_stock_count"],
  sales_staff: ["invoice_total"],
  employee: ["employee_count"],
};

const COPY_BY_ROLE: Record<
  MembershipRole,
  Pick<DashboardSummary, "title" | "description" | "highlights">
> = {
  super_admin: {
    title: "Platform operations snapshot",
    description:
      "Monitor the core company signals that matter from a darker, high-clarity control layer.",
    highlights: [
      "Start with the most critical workspace areas in this MVP.",
      "Expand into company setup, finance, and operations as more flows launch.",
    ],
  },
  company_admin: {
    title: "Company command center",
    description:
      "Keep an eye on people, stock, receivables, and spend from a single executive surface.",
    highlights: [
      "Use this dashboard as the daily launchpad for the rest of the workspace.",
      "Role-aware navigation keeps the team focused on what they own.",
    ],
  },
  hr_manager: {
    title: "People operations overview",
    description:
      "Focus on workforce readiness while finance and inventory modules stay out of the way.",
    highlights: [
      "Headcount visibility is available now.",
      "Reports remain visible for broader HR summaries.",
    ],
  },
  finance_manager: {
    title: "Finance control center",
    description:
      "Review receivables and spend from a focused finance control layer built for quick scanning.",
    highlights: [
      "Keep receivables and spend aligned.",
      "Use reports for deeper finance analysis as data services expand.",
    ],
  },
  inventory_manager: {
    title: "Inventory overview",
    description:
      "Track replenishment risk first, then move into stock workflows as the inventory module grows.",
    highlights: [
      "Low-stock monitoring is the first inventory KPI on the board.",
      "Reports stay available for broader operational trends.",
    ],
  },
  sales_staff: {
    title: "Sales workspace",
    description:
      "Stay focused on customers and invoice flow with a narrower daily command view.",
    highlights: [
      "Customer and invoice areas stay front and center.",
      "Extra admin modules stay hidden until they are relevant to your role.",
    ],
  },
  employee: {
    title: "Personal workspace",
    description:
      "A simple landing page keeps the MVP approachable while the wider workspace continues to mature.",
    highlights: [
      "Start here for a lightweight overview of the company workspace.",
      "Additional self-service experiences can layer onto this foundation later.",
    ],
  },
};

export async function getDashboardSummary(
  role: MembershipRole | null,
): Promise<DashboardSummary> {
  if (!role) {
    throw new Error("Dashboard summary requires an authorized role.");
  }

  const metricIds = METRICS_BY_ROLE[role];
  const copy = COPY_BY_ROLE[role];

  return {
    ...copy,
    metrics: metricIds.map((metricId) => DASHBOARD_METRICS[metricId]),
  };
}
