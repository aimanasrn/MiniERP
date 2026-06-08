import React from "react";
import { render, screen } from "@testing-library/react";

import ReportsPage from "./page";

const { requireRouteAccessMock } = vi.hoisted(() => ({
  requireRouteAccessMock: vi.fn(),
}));

vi.mock("../../../lib/auth/guards", () => ({
  requireRouteAccess: requireRouteAccessMock,
}));

describe("ReportsPage", () => {
  it("renders the reporting workspace", async () => {
    requireRouteAccessMock.mockResolvedValue({
      role: "finance_manager",
    });

    render(await ReportsPage());

    expect(screen.getByRole("heading", { name: /finance performance brief/i })).toBeInTheDocument();
    expect(screen.getByText(/monthly finance pulse/i)).toBeInTheDocument();
    expect(screen.getByText(/net operating position/i)).toBeInTheDocument();
  });
});
