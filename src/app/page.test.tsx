import { render, screen } from "@testing-library/react";
import React from "react";

import HomePage from "./page";

describe("HomePage", () => {
  it("renders the MiniERP headline", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", {
        name: /modern erp for growing companies/i,
      }),
    ).toBeInTheDocument();
  });
});
