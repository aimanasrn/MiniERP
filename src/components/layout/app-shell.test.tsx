import React from "react";
import { render, screen } from "@testing-library/react";

import { AppShell } from "./app-shell";

describe("AppShell", () => {
  it("renders the main navigation heading", () => {
    render(<AppShell role="company_admin">dashboard</AppShell>);

    expect(screen.getByText(/operations hub/i)).toBeInTheDocument();
  });
});
