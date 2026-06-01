import React from "react";

import { APP_NAV_ITEMS } from "../../../components/layout/app-navigation";
import { PageHeader } from "../../../components/shared/page-header";
import { StatCard } from "../../../components/shared/stat-card";
import { requireRouteAccess } from "../../../lib/auth/guards";
import { getVisibleNavItems } from "../../../lib/rbac/permissions";
import { getRoleLabel } from "../../../lib/rbac/roles";
import { getDashboardSummary } from "../../../features/dashboard/data/dashboard-service";

export default async function DashboardPage() {
  const session = await requireRouteAccess("/dashboard");

  if (!session || !session.role) {
    return null;
  }

  const summary = await getDashboardSummary(session.role);
  const visibleModules = new Set(
    getVisibleNavItems(session.role).filter((href) => href !== "/dashboard"),
  );
  const visibleModuleLabels = APP_NAV_ITEMS.filter((item) =>
    item.href !== "/dashboard" && visibleModules.has(item.href),
  ).map((item) => item.label);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={getRoleLabel(session.role)}
        title={summary.title}
        description={summary.description}
      />

      <section
        aria-label="Dashboard metrics"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        {summary.metrics.map((metric) => (
          <StatCard
            change={metric.change}
            detail={metric.detail}
            key={metric.id}
            label={metric.label}
            value={metric.value}
          />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <article className="rounded-[22px] border border-[rgba(103,232,249,0.18)] bg-[linear-gradient(160deg,rgba(17,33,59,0.96),rgba(10,22,40,0.98))] p-6 shadow-[var(--shadow-md)]">
          <p className="page-header__eyebrow">Priority queue</p>
          <h3 className="m-0 text-2xl tracking-[-0.03em] text-[var(--text)]">
            Current MVP priorities
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-soft)]">
            Keep the command layer clean while the rest of the ERP surface comes online.
          </p>
          <ul className="mb-0 mt-5 grid gap-3 pl-5 text-[var(--text-muted)]">
            {summary.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-[22px] border border-[rgba(96,165,250,0.2)] bg-[rgba(15,29,53,0.88)] p-6 shadow-[var(--shadow-md)] backdrop-blur-[18px]">
          <p className="page-header__eyebrow">Active lanes</p>
          <h3 className="m-0 text-2xl tracking-[-0.03em] text-[var(--text)]">
            What you can open now
          </h3>
          <ul className="mb-0 mt-5 grid gap-3 pl-5 text-[var(--text-muted)]">
            {visibleModuleLabels.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
