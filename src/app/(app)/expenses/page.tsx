import React from "react";

import { DataTable } from "@/components/shared/data-table";
import { FilterBar } from "@/components/shared/filter-bar";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { ExpenseForm } from "@/features/expenses/components/expense-form";
import { getExpenseMetrics } from "@/features/expenses/data/expense-service";
import { requireRouteAccess } from "@/lib/auth/guards";
import type { ExpenseStatus } from "@/types/database";

const currencyFormatter = new Intl.NumberFormat("en-MY", {
  style: "currency",
  currency: "MYR",
  minimumFractionDigits: 2,
});

const expenses: Array<{
  expense_date: string;
  category: string;
  vendor: string;
  owner: string;
  amount: string;
  status: ExpenseStatus;
}> = [
  {
    expense_date: "2026-06-05",
    category: "Travel",
    vendor: "Railink Mobility",
    owner: "Hana Musa",
    amount: "480.50",
    status: "submitted",
  },
  {
    expense_date: "2026-06-03",
    category: "Software",
    vendor: "Ledger Cloud",
    owner: "Nadia Zaki",
    amount: "220.00",
    status: "approved",
  },
  {
    expense_date: "2026-06-01",
    category: "Office",
    vendor: "Metro Supplies",
    owner: "Irene Tan",
    amount: "95.80",
    status: "paid",
  },
  {
    expense_date: "2026-05-30",
    category: "Events",
    vendor: "Harbor Hall",
    owner: "Syed Faris",
    amount: "560.00",
    status: "draft",
  },
];

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export default async function ExpensesPage() {
  await requireRouteAccess("/expenses");

  const metrics = getExpenseMetrics(expenses);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Finance manager lane"
        title="Expense control desk"
        description="Track outbound spend with clear category ownership, vendor visibility, and approval readiness."
      />

      <section
        aria-label="Expense metrics"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard label="Expense entries" value={String(metrics.totalExpenses)} detail="Current spend requests and settled payments in scope." />
        <StatCard label="Spend tracked" value={formatCurrency(metrics.totalSpend)} change={`${metrics.approved} approved and ready to clear`} />
        <StatCard label="Awaiting review" value={String(metrics.submitted)} detail="Submitted claims still in the finance approval queue." />
        <StatCard label="Paid items" value={String(metrics.paid)} detail="Expenses already completed and posted." />
      </section>

      <FilterBar
        searchPlaceholder="Search expenses by category, vendor, or owner"
        filters={(
          <>
            <StatusBadge label={`${metrics.draft} drafts`} tone="info" />
            <StatusBadge label={`${metrics.submitted} submitted`} tone="warning" />
          </>
        )}
        actions={<button className="button-primary" type="button">Review payment run</button>}
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="rounded-[22px] border border-[var(--line)] bg-[rgba(15,29,53,0.88)] p-5 shadow-[var(--shadow-md)]">
            <p className="page-header__eyebrow">Spend approval board</p>
            <h3 className="m-0 text-2xl tracking-[-0.03em] text-[var(--text)]">
              Outbound cost coverage by workflow stage
            </h3>
            <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
              Separate claims that need approval from those already paid so weekly finance close remains predictable.
            </p>
          </div>

          <DataTable
            caption="Expense tracking table with vendor and approval context."
            columns={["Date", "Category", "Vendor", "Owner", "Amount", "Status"]}
            rows={expenses.map((expense) => [
              expense.expense_date,
              expense.category,
              expense.vendor,
              expense.owner,
              formatCurrency(Number(expense.amount)),
              <StatusBadge
                key={`${expense.expense_date}-${expense.vendor}`}
                label={expense.status}
                tone={
                  expense.status === "paid"
                    ? "success"
                    : expense.status === "rejected"
                      ? "neutral"
                      : expense.status === "approved"
                        ? "info"
                        : "warning"
                }
              />,
            ])}
          />
        </div>

        <ExpenseForm />
      </section>
    </div>
  );
}
