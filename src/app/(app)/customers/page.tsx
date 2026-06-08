import React from "react";

import { DataTable } from "@/components/shared/data-table";
import { FilterBar } from "@/components/shared/filter-bar";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { CustomerForm } from "@/features/customers/components/customer-form";
import { getCustomerMetrics } from "@/features/customers/data/customer-service";
import { requireRouteAccess } from "@/lib/auth/guards";

const customers = [
  {
    name: "Apex Trading",
    contact_person: "Hana Musa",
    email: "sales@apex.test",
    phone: "+60 11-234 7777",
    billing_address: "Level 18, Jalan Ampang",
    status: "active",
  },
  {
    name: "Lattice Retail",
    contact_person: "Syed Faris",
    email: "ops@lattice.test",
    phone: "+60 17-778 2020",
    billing_address: "Penang Logistics Park",
    status: "inactive",
  },
  {
    name: "Nova Health",
    contact_person: "Irene Tan",
    email: "finance@nova.test",
    phone: "+60 12-510 9898",
    billing_address: "Mid Valley City",
    status: "archived",
  },
  {
    name: "Summit Foods",
    contact_person: "Rafiq Arman",
    email: "buyers@summit.test",
    phone: "+60 16-445 1100",
    billing_address: "Johor Innovation Hub",
    status: "active",
  },
] as const;

export default async function CustomersPage() {
  await requireRouteAccess("/customers");

  const metrics = getCustomerMetrics(customers);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Sales staff lane"
        title="Customer pipeline desk"
        description="Keep account intelligence, billing readiness, and relationship follow-up in one customer-facing workspace."
      />

      <section
        aria-label="Customer metrics"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard label="Accounts tracked" value={String(metrics.total)} detail="Total customer records in the current roster." />
        <StatCard label="Active accounts" value={String(metrics.active)} change="2 priority renewals" />
        <StatCard label="Inactive accounts" value={String(metrics.inactive)} detail="Needs reactivation follow-up." />
        <StatCard label="Archived accounts" value={String(metrics.archived)} detail="Kept for historical billing reference." />
      </section>

      <FilterBar
        searchPlaceholder="Search customers by company, contact, or billing location"
        filters={(
          <>
            <StatusBadge label="Sales-owned" tone="info" />
            <StatusBadge label="2 active accounts" tone="success" />
          </>
        )}
        actions={<button className="button-primary" type="button">Open outreach queue</button>}
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="rounded-[22px] border border-[var(--line)] bg-[rgba(15,29,53,0.88)] p-5 shadow-[var(--shadow-md)]">
            <p className="page-header__eyebrow">Relationship pipeline</p>
            <h3 className="m-0 text-2xl tracking-[-0.03em] text-[var(--text)]">
              Customer coverage by billing readiness
            </h3>
            <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
              Keep finance handoff clean by anchoring every account to a confirmed contact and billing destination.
            </p>
          </div>

          <DataTable
            caption="Customer relationship table with billing context."
            columns={["Company", "Contact", "Email", "Phone", "Billing", "Status"]}
            rows={customers.map((customer) => [
              customer.name,
              customer.contact_person,
              customer.email,
              customer.phone,
              customer.billing_address,
              <StatusBadge
                key={`${customer.name}-status`}
                label={customer.status}
                tone={
                  customer.status === "active"
                    ? "success"
                    : customer.status === "inactive"
                      ? "warning"
                      : "neutral"
                }
              />,
            ])}
          />
        </div>

        <CustomerForm />
      </section>
    </div>
  );
}
