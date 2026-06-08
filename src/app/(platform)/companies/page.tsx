import React from "react";

import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { requireRouteAccess } from "@/lib/auth/guards";

const companyRows = [
  {
    name: "ERPFlow Manufacturing",
    slug: "erpflow-manufacturing",
    industry: "Industrial operations",
    region: "Malaysia",
    status: "active",
  },
  {
    name: "Northstar Services",
    slug: "northstar-services",
    industry: "Business services",
    region: "Singapore",
    status: "onboarding",
  },
  {
    name: "Summit Retail Group",
    slug: "summit-retail-group",
    industry: "Retail",
    region: "Indonesia",
    status: "invited",
  },
] as const;

export default async function CompaniesPage() {
  await requireRouteAccess("/companies");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Platform admin lane"
        title="Platform company registry"
        description="Monitor tenant setup quality, onboarding pressure, and which companies still need their first operating admin."
      />

      <section
        aria-label="Platform company metrics"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard label="Companies tracked" value={String(companyRows.length)} detail="All tenant records currently visible to the platform team." />
        <StatCard label="Active companies" value="1" change="1 workspace already live" />
        <StatCard label="Onboarding queue" value="2" detail="Companies still moving through invite and setup stages." />
        <StatCard label="Next action" value="Invite admin" detail="Invite the first company admin wherever setup has not started." />
      </section>

      <section className="rounded-[22px] border border-[rgba(96,165,250,0.2)] bg-[rgba(15,29,53,0.88)] p-6 shadow-[var(--shadow-md)] backdrop-blur-[18px]">
        <p className="page-header__eyebrow">Platform checklist</p>
        <h3 className="m-0 text-2xl tracking-[-0.03em] text-[var(--text)]">
          Invite the first company admin before deeper tenant operations begin
        </h3>
        <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
          This entry point intentionally keeps platform admin work at the smoke-test level for the MVP while preserving the multi-company architecture.
        </p>
      </section>

      <DataTable
        caption="Platform company registry for super admin review."
        columns={["Company", "Slug", "Industry", "Region", "Status"]}
        rows={companyRows.map((company) => [
          company.name,
          company.slug,
          company.industry,
          company.region,
          <StatusBadge
            key={`${company.slug}-status`}
            label={company.status}
            tone={
              company.status === "active"
                ? "success"
                : company.status === "onboarding"
                  ? "warning"
                  : "info"
            }
          />,
        ])}
      />
    </div>
  );
}
