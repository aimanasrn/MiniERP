import React from "react";

import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  buildReportSeries,
  summarizeFinance,
} from "@/features/reports/data/report-service";
import { requireRouteAccess } from "@/lib/auth/guards";

const currencyFormatter = new Intl.NumberFormat("en-MY", {
  style: "currency",
  currency: "MYR",
  minimumFractionDigits: 2,
});

const financeSnapshots = [
  { label: "Apr", invoices: [650, 430], expenses: [290, 120] },
  { label: "May", invoices: [820, 510], expenses: [360, 190] },
  { label: "Jun", invoices: [910, 790, 420], expenses: [420, 205, 110] },
];

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export default async function ReportsPage() {
  await requireRouteAccess("/reports");

  const currentSummary = summarizeFinance(
    financeSnapshots.flatMap((snapshot) => snapshot.invoices),
    financeSnapshots.flatMap((snapshot) => snapshot.expenses),
  );
  const series = buildReportSeries(financeSnapshots);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Leadership snapshot"
        title="Finance performance brief"
        description="Turn invoice and expense activity into a clear monthly operating signal for the current MVP finance view."
      />

      <section
        aria-label="Finance summary"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard label="Invoiced volume" value={formatCurrency(currentSummary.invoiceTotal)} detail="Three-month billing output across the finance workspace." />
        <StatCard label="Expense load" value={formatCurrency(currentSummary.expenseTotal)} detail="Tracked spend captured for the same reporting window." />
        <StatCard label="Net operating position" value={formatCurrency(currentSummary.net)} change={`${currentSummary.marginPercentage}% margin across current activity`} />
        <StatCard label="Months covered" value={String(series.length)} detail="Rolling three-month finance view in this MVP report." />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[22px] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(17,33,59,0.94),rgba(10,22,40,0.96))] p-6 shadow-[var(--shadow-md)]">
          <p className="page-header__eyebrow">Monthly finance pulse</p>
          <h3 className="m-0 text-2xl tracking-[-0.03em] text-[var(--text)]">
            Margin trend from billing to spend
          </h3>
          <div className="mt-5 space-y-4">
            {series.map((entry) => (
              <div
                key={entry.label}
                className="rounded-2xl border border-[var(--line)] bg-[rgba(248,251,255,0.03)] p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="m-0 text-sm font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">
                      {entry.label}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[var(--text)]">
                      {formatCurrency(entry.net)}
                    </p>
                  </div>
                  <StatusBadge
                    label={entry.net >= 0 ? "Positive net" : "Negative net"}
                    tone={entry.net >= 0 ? "success" : "warning"}
                  />
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgba(248,251,255,0.08)]">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#5eead4,#38bdf8)]"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(18, (Math.abs(entry.net) / Math.max(entry.invoiceTotal, 1)) * 100),
                      )}%`,
                    }}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-[var(--text-muted)]">
                  <span>Invoices {formatCurrency(entry.invoiceTotal)}</span>
                  <span>Expenses {formatCurrency(entry.expenseTotal)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[22px] border border-[var(--line)] bg-[rgba(15,29,53,0.88)] p-5 shadow-[var(--shadow-md)]">
            <p className="page-header__eyebrow">Operator readout</p>
            <h3 className="m-0 text-2xl tracking-[-0.03em] text-[var(--text)]">
              Finance levers that shape the next close
            </h3>
            <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
              Keep the monthly story focused on how invoice momentum, cost control, and margin interact in one executive surface.
            </p>
          </div>

          <DataTable
            caption="Monthly finance summary with invoice, expense, and net totals."
            columns={["Month", "Invoices", "Expenses", "Net", "Signal"]}
            rows={series.map((entry) => [
              entry.label,
              formatCurrency(entry.invoiceTotal),
              formatCurrency(entry.expenseTotal),
              formatCurrency(entry.net),
              <StatusBadge
                key={`${entry.label}-signal`}
                label={entry.net >= 0 ? "On plan" : "Under pressure"}
                tone={entry.net >= 0 ? "success" : "warning"}
              />,
            ])}
          />
        </div>
      </section>
    </div>
  );
}
