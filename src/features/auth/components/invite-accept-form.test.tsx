import React from "react";
import { render, screen } from "@testing-library/react";

import { InviteAcceptForm } from "./invite-accept-form";

describe("InviteAcceptForm", () => {
  it("renders the invited email and account actions", () => {
    render(
      <InviteAcceptForm
        companyName="Northwind Foods"
        email="admin@northwind.test"
        role="company_admin"
        token="invite-token"
      />,
    );

    expect(screen.getByDisplayValue("admin@northwind.test")).toBeDisabled();
    expect(
      screen.getByRole("button", {
        name: /create account/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /email me a magic link/i,
      }),
    ).toBeInTheDocument();
  });
});
