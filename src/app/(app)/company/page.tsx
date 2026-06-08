import React from "react";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { CompanySetupForm } from "@/features/company/components/company-setup-form";
import { requireRouteAccess } from "@/lib/auth/guards";

const companySignals = [
  "Workspace timezone aligned to Kuala Lumpur operations.",
  "Primary finance currency is set to MYR for the MVP billing layer.",
  "Core company profile is visible before deeper admin flows arrive.",
];

export default async function CompanyPage() {
  await requireRouteAccess("/company");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Company admin lane"
        title="Company profile workspace"
        description="Keep the foundational company details clean so every ERP module inherits the same operating context."
        actions={<StatusBadge label="Admin managed" tone="info" />}
      />

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[22px] border border-[rgba(103,232,249,0.18)] bg-[linear-gradient(170deg,rgba(17,33,59,0.96),rgba(10,22,40,0.98))] p-6 shadow-[var(--shadow-md)]">
          <p className="page-header__eyebrow">Operating context</p>
          <h3 className="m-0 text-2xl tracking-[-0.03em] text-[var(--text)]">
            Baseline company settings for the current workspace
          </h3>
          <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">
            This page intentionally stays focused on the company profile shell for the MVP while deeper governance tools remain outside scope.
          </p>
          <ul className="mb-0 mt-5 grid gap-3 pl-5 text-sm leading-6 text-[var(--text-muted)]">
            {companySignals.map((signal) => (
              <li key={signal}>{signal}</li>
            ))}
          </ul>
        </article>

        <CompanySetupForm
          initialValues={{
            name: "ERPFlow Manufacturing",
            industry: "Industrial operations",
            country: "Malaysia",
            currencyCode: "MYR",
            timezone: "Asia/Kuala_Lumpur",
          }}
          submitLabel="Save company setup"
        />
      </section>
    </div>
  );
}
