import React from "react";

import { ComingSoon } from "@/components/shared/coming-soon";
import { PageHeader } from "@/components/shared/page-header";
import { requireRouteAccess } from "@/lib/auth/guards";

export default async function PayrollPage() {
  await requireRouteAccess("/payroll");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Planned expansion"
        title="Payroll"
        description="Keep payroll visible in the ERP map while the MVP stays focused on the completed operational lanes."
      />
      <ComingSoon
        title="Payroll"
        description="Compensation runs, payslip delivery, and payroll approvals are intentionally deferred while the MVP hardens the shared admin shell."
      />
    </div>
  );
}
