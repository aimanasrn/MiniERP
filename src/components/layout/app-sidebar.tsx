import React from "react";
import Link from "next/link";

import { APP_NAV_ITEMS } from "./app-navigation";
import { getVisibleNavItems } from "../../lib/rbac/permissions";
import { getRoleLabel } from "../../lib/rbac/roles";
import type { MembershipRole } from "../../types/database";

type AppSidebarProps = {
  role: MembershipRole | null;
};

export function AppSidebar({ role }: AppSidebarProps) {
  const visibleNavItems = APP_NAV_ITEMS.filter((item) =>
    getVisibleNavItems(role).includes(item.href),
  );
  const footerValue = role
    ? `${visibleNavItems.length} areas active`
    : "Awaiting role assignment";

  return (
    <aside className="app-sidebar">
      <div className="app-sidebar__brand">
        <p className="app-sidebar__eyebrow">ERPFlow</p>
        <h2 className="app-sidebar__title">Command center</h2>
        <p className="app-sidebar__role">Access profile {getRoleLabel(role)}</p>
      </div>

      <nav aria-label="Primary navigation" className="app-sidebar__nav">
        {visibleNavItems.map((item) => (
          <Link className="app-sidebar__link" href={item.href} key={item.href}>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="app-sidebar__footer">
        <p className="app-sidebar__footer-label">Workspace status</p>
        <p className="app-sidebar__footer-value">{footerValue}</p>
      </div>
    </aside>
  );
}
