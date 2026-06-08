import React from "react";

import { DataTable } from "@/components/shared/data-table";
import { FilterBar } from "@/components/shared/filter-bar";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { InvoiceForm } from "@/features/invoices/components/invoice-form";
import { getInvoiceMetrics } from "@/features/invoices/data/invoice-service";
import { requireRouteAccess } from "@/lib/auth/guards";
import type { InvoiceStatus } from "@/types/database";

const currencyFormatter = new Intl.NumberFormat("en-MY", {
  style: "currency",
  currency: "MYR",
  minimumFractionDigits: 2,
});

const invoices: Array<{
  invoice_number: string;
  customer: string;
  issue_date: string;
  due_date: string;
  owner: string;
  total_amount: string;
  status: InvoiceStatus;
}> = [
  {
    invoice_number: "INV-2031",
    customer: "Apex Trading",
    issue_date: "2026-06-01",
    due_date: "2026-06-15",
    owner: "Nadia Zaki",
    total_amount: "137.50",
    status: "draft",
  },
  {
    invoice_number: "INV-2030",
    customer: "Nova Health",
    issue_date: "2026-05-28",
    due_date: "2026-06-12",
    owner: "Syed Faris",
    total_amount: "980.00",
    status: "sent",
  },
  {
    invoice_number: "INV-2024",
    customer: "Summit Foods",
    issue_date: "2026-05-10",
    due_date: "2026-05-24",
    owner: "Hana Musa",
    total_amount: "1520.00",
    status: "paid",
  },
  {
    invoice_number: "INV-2018",
    customer: "Lattice Retail",
    issue_date: "2026-04-30",
    due_date: "2026-05-14",
    owner: "Irene Tan",
    total_amount: "610.00",
    status: "overdue",
  },
];

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export default async function InvoicesPage() {
  await requireRouteAccess("/invoices");

  const metrics = getInvoiceMetrics(invoices);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Finance manager lane"
        title="Invoice revenue desk"
        description="Control billing throughput, watch open receivables, and keep finance and sales handoffs aligned."
      />

      <section
        aria-label="Invoice metrics"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          label="Invoices in view"
          value={String(metrics.totalInvoices)}
          detail="Current working set across draft, sent, paid, and overdue."
        />
        <StatCard
          label="Settled revenue"
          value={formatCurrency(metrics.recognizedRevenue)}
          change={`${metrics.paidInvoices} paid invoice settled`}
        />
        <StatCard
          label="Outstanding revenue"
          value={formatCurrency(metrics.outstandingRevenue)}
          detail="Sent and overdue invoices still awaiting cash collection."
        />
        <StatCard
          label="Drafts to release"
          value={String(metrics.draftInvoices)}
          detail="Billing operations ready for review and dispatch."
        />
      </section>

      <FilterBar
        searchPlaceholder="Search invoices by number, customer, or owner"
        filters={(
          <>
            <StatusBadge label={`${metrics.sentInvoices} sent`} tone="info" />
            <StatusBadge label={`${metrics.overdueInvoices} overdue`} tone="warning" />
          </>
        )}
        actions={<button className="button-primary" type="button">Schedule collection review</button>}
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="rounded-[22px] border border-[var(--line)] bg-[rgba(15,29,53,0.88)] p-5 shadow-[var(--shadow-md)]">
            <p className="page-header__eyebrow">Cash collection radar</p>
            <h3 className="m-0 text-2xl tracking-[-0.03em] text-[var(--text)]">
              Billing commitments by receivable status
            </h3>
            <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
              Keep customer-ready invoices moving while surfacing late accounts that need faster collection follow-through.
            </p>
          </div>

          <DataTable
            caption="Invoice operations table with revenue and collection context."
            columns={["Invoice", "Customer", "Issue date", "Due date", "Owner", "Status"]}
            rows={invoices.map((invoice) => [
              invoice.invoice_number,
              invoice.customer,
              invoice.issue_date,
              invoice.due_date,
              `${invoice.owner} - ${formatCurrency(Number(invoice.total_amount))}`,
              <StatusBadge
                key={`${invoice.invoice_number}-status`}
                label={invoice.status}
                tone={
                  invoice.status === "paid"
                    ? "success"
                    : invoice.status === "overdue"
                      ? "warning"
                      : invoice.status === "void"
                        ? "neutral"
                        : "info"
                }
              />,
            ])}
          />
        </div>

        <InvoiceForm />
      </section>
    </div>
  );
}
