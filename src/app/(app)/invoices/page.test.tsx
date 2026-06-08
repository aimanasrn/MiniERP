import React from "react";
import { render, screen } from "@testing-library/react";

import InvoicesPage from "./page";

const { requireRouteAccessMock } = vi.hoisted(() => ({
  requireRouteAccessMock: vi.fn(),
}));

vi.mock("../../../lib/auth/guards", () => ({
  requireRouteAccess: requireRouteAccessMock,
}));

describe("InvoicesPage", () => {
  it("renders the invoice workspace", async () => {
    requireRouteAccessMock.mockResolvedValue({
      role: "finance_manager",
    });

    render(await InvoicesPage());

    expect(screen.getByRole("heading", { name: /invoice revenue desk/i })).toBeInTheDocument();
    expect(screen.getByText(/cash collection radar/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save invoice/i })).toBeInTheDocument();
  });
});
