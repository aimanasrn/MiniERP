import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import LoginPage from "./page";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  getSession: vi.fn(),
}));

describe("LoginPage", () => {
  it("renders callback errors from the query string", async () => {
    render(
      await LoginPage({
        searchParams: Promise.resolve({
          error: "Magic link expired.",
        }),
      }),
    );

    expect(screen.getByText("Magic link expired.")).toBeInTheDocument();
    expect(screen.getByText(/authentication issue/i)).toBeInTheDocument();
  });
});
