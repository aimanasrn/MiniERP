import React from "react";
import { render, screen } from "@testing-library/react";

import { AppShell } from "./app-shell";

describe("AppShell", () => {
  it("renders the ERPFlow shell framing", () => {
    render(<AppShell role="company_admin">dashboard</AppShell>);

    expect(screen.getByText(/command center/i)).toBeInTheDocument();
    expect(screen.getByText(/dark erpflow workspace/i)).toBeInTheDocument();
  });
});
