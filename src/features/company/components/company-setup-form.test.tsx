import React from "react";
import { render, screen } from "@testing-library/react";

import { CompanySetupForm } from "./company-setup-form";

describe("CompanySetupForm", () => {
  it("renders initial company values for setup", () => {
    render(
      <CompanySetupForm
        initialValues={{
          name: "Northwind Foods",
          industry: "Distribution",
          country: "Malaysia",
          currencyCode: "MYR",
          timezone: "Asia/Kuala_Lumpur",
        }}
      />,
    );

    expect(screen.getByDisplayValue("Northwind Foods")).toBeInTheDocument();
    expect(screen.getByDisplayValue("MYR")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /save company setup/i,
      }),
    ).toBeInTheDocument();
  });
});
