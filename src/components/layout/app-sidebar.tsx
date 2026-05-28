import React from "react";
import Link from "next/link";

import { APP_NAV_ITEMS } from "./app-navigation";

function formatRoleLabel(role: string | null) {
  if (!role) {
    return "Role pending";
  }

  return role
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

type AppSidebarProps = {
  role: string | null;
};

export function AppSidebar({ role }: AppSidebarProps) {
  return (
    <aside className="app-sidebar">
      <div className="app-sidebar__brand">
        <p className="app-sidebar__eyebrow">MiniERP</p>
        <h2 className="app-sidebar__title">Operations Hub</h2>
        <p className="app-sidebar__role">Signed in as {formatRoleLabel(role)}</p>
      </div>

      <nav aria-label="Primary navigation" className="app-sidebar__nav">
        {APP_NAV_ITEMS.map((item) => (
          <Link className="app-sidebar__link" href={item.href} key={item.href}>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
