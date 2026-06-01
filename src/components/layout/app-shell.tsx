import React, { type ReactNode } from "react";

import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";
import type { MembershipRole } from "../../types/database";

type AppShellProps = {
  children: ReactNode;
  role: MembershipRole | null;
};

export function AppShell({ children, role }: AppShellProps) {
  return (
    <div className="app-shell">
      <div className="app-shell__grid">
        <AppSidebar role={role} />
        <div className="app-shell__content">
          <AppHeader />
          <main className="app-shell__main">{children}</main>
        </div>
      </div>
    </div>
  );
}
