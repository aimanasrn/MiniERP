import React from "react";
import { render, screen } from "@testing-library/react";

import EmployeesPage from "./page";

const { requireRouteAccessMock } = vi.hoisted(() => ({
  requireRouteAccessMock: vi.fn(),
}));

vi.mock("../../../lib/auth/guards", () => ({
  requireRouteAccess: requireRouteAccessMock,
}));

describe("EmployeesPage", () => {
  it("renders the employee module workspace", async () => {
    requireRouteAccessMock.mockResolvedValue({
      role: "hr_manager",
    });

    render(await EmployeesPage());

    expect(screen.getByRole("heading", { name: /employee operations hub/i })).toBeInTheDocument();
    expect(screen.getByText(/team roster/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save employee/i })).toBeInTheDocument();
  });
});
