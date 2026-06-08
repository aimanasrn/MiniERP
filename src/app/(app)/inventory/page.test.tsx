import React from "react";
import { render, screen } from "@testing-library/react";

import InventoryPage from "./page";

const { requireRouteAccessMock } = vi.hoisted(() => ({
  requireRouteAccessMock: vi.fn(),
}));

vi.mock("../../../lib/auth/guards", () => ({
  requireRouteAccess: requireRouteAccessMock,
}));

describe("InventoryPage", () => {
  it("renders the inventory module workspace", async () => {
    requireRouteAccessMock.mockResolvedValue({
      role: "inventory_manager",
    });

    render(await InventoryPage());

    expect(screen.getByRole("heading", { name: /inventory control center/i })).toBeInTheDocument();
    expect(screen.getByText(/stock watchlist/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save product/i })).toBeInTheDocument();
    expect(screen.getByText(/^1 low-stock$/i)).toBeInTheDocument();
    expect(screen.getAllByText(/^archived$/i)).toHaveLength(2);
    expect(screen.getByText(/^Low-stock alert$/i)).toBeInTheDocument();
  });
});
