import React from "react";
import { render, screen } from "@testing-library/react";

import LoginPage from "@/app/(public)/login/page";

describe("auth smoke", () => {
  it("login page shows the magic link flow", async () => {
    render(await LoginPage({ searchParams: Promise.resolve({}) }));

    expect(
      screen.getByRole("button", { name: /send magic link/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /sign in to continue your company workspace/i,
      }),
    ).toBeInTheDocument();
  });
});
