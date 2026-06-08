import React from "react";

import { ComingSoon } from "@/components/shared/coming-soon";
import { PageHeader } from "@/components/shared/page-header";
import { requireRouteAccess } from "@/lib/auth/guards";

export default async function AccountingPage() {
  await requireRouteAccess("/accounting");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Planned expansion"
        title="Accounting"
        description="Accounting remains visible so finance leadership can see the intended platform direction without expanding the MVP scope."
      />
      <ComingSoon
        title="Accounting"
        description="Ledger workflows, reconciliations, and close controls are queued behind the current MVP delivery lanes."
      />
    </div>
  );
}
