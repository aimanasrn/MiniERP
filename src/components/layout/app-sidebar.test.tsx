import React from "react";
import { render, screen } from "@testing-library/react";

import { APP_NAV_ITEMS } from "./app-navigation";
import { AppSidebar } from "./app-sidebar";

describe("AppSidebar", () => {
  it("renders navigation from the shared app navigation definition", () => {
    render(<AppSidebar role="company_admin" />);

    for (const item of APP_NAV_ITEMS) {
      expect(screen.getByRole("link", { name: item.label })).toHaveAttribute(
        "href",
        item.href,
      );
    }
  });

  it("shows a safe status when no active role is available", () => {
    render(<AppSidebar role={null} />);

    expect(screen.getByText(/role pending/i)).toBeInTheDocument();
  });
});
