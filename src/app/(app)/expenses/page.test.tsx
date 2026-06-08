import React from "react";
import { render, screen } from "@testing-library/react";

import ExpensesPage from "./page";

const { requireRouteAccessMock } = vi.hoisted(() => ({
  requireRouteAccessMock: vi.fn(),
}));

vi.mock("../../../lib/auth/guards", () => ({
  requireRouteAccess: requireRouteAccessMock,
}));

describe("ExpensesPage", () => {
  it("renders the expense workspace", async () => {
    requireRouteAccessMock.mockResolvedValue({
      role: "finance_manager",
    });

    render(await ExpensesPage());

    expect(screen.getByRole("heading", { name: /expense control desk/i })).toBeInTheDocument();
    expect(screen.getByText(/spend approval board/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save expense/i })).toBeInTheDocument();
  });
});
