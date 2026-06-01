import React from "react";
import { render, screen } from "@testing-library/react";

import { APP_NAV_ITEMS } from "./app-navigation";
import { AppSidebar } from "./app-sidebar";
import { getVisibleNavItems } from "../../lib/rbac/permissions";

describe("AppSidebar", () => {
  it("uses the ERPFlow workspace framing for the shared navigation", () => {
    render(<AppSidebar role="company_admin" />);

    expect(screen.getByText("ERPFlow")).toBeInTheDocument();
    expect(screen.getByText("Command center")).toBeInTheDocument();
    expect(screen.getByText(/access profile company admin/i)).toBeInTheDocument();
  });

  it("renders only the shared navigation entries visible to the current role", () => {
    render(<AppSidebar role="company_admin" />);

    const visibleItems = APP_NAV_ITEMS.filter((item) =>
      getVisibleNavItems("company_admin").includes(item.href),
    );
    const hiddenItems = APP_NAV_ITEMS.filter(
      (item) => !getVisibleNavItems("company_admin").includes(item.href),
    );

    for (const item of visibleItems) {
      expect(screen.getByRole("link", { name: item.label })).toHaveAttribute(
        "href",
        item.href,
      );
    }

    for (const item of hiddenItems) {
      expect(
        screen.queryByRole("link", { name: item.label }),
      ).not.toBeInTheDocument();
    }
  });

  it("shows a safe status when no active role is available", () => {
    render(<AppSidebar role={null} />);

    expect(screen.getByText(/access profile role pending/i)).toBeInTheDocument();
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(screen.getByText("Awaiting role assignment")).toBeInTheDocument();
  });
});
