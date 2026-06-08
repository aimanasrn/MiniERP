import React from "react";
import { render, screen } from "@testing-library/react";

import CustomersPage from "./page";

const { requireRouteAccessMock } = vi.hoisted(() => ({
  requireRouteAccessMock: vi.fn(),
}));

vi.mock("../../../lib/auth/guards", () => ({
  requireRouteAccess: requireRouteAccessMock,
}));

describe("CustomersPage", () => {
  it("renders the customer module workspace", async () => {
    requireRouteAccessMock.mockResolvedValue({
      role: "sales_staff",
    });

    render(await CustomersPage());

    expect(screen.getByRole("heading", { name: /customer pipeline desk/i })).toBeInTheDocument();
    expect(screen.getByText(/relationship pipeline/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save customer/i })).toBeInTheDocument();
  });
});
