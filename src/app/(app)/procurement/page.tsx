import React from "react";

import { ComingSoon } from "@/components/shared/coming-soon";
import { PageHeader } from "@/components/shared/page-header";
import { requireRouteAccess } from "@/lib/auth/guards";

export default async function ProcurementPage() {
  await requireRouteAccess("/procurement");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Planned expansion"
        title="Procurement"
        description="Procurement stays present in the command map so inventory and finance teams can see the next surface coming online."
      />
      <ComingSoon
        title="Procurement"
        description="Vendor requests, purchase approvals, and receiving workflows will layer onto this placeholder after the MVP CRUD foundation."
      />
    </div>
  );
}
