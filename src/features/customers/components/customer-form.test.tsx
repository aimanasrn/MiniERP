import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { CustomerForm } from "./customer-form";

describe("CustomerForm", () => {
  it("submits normalized customer values", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<CustomerForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/customer name/i), {
      target: { value: " Apex Trading " },
    });
    fireEvent.change(screen.getByLabelText(/contact person/i), {
      target: { value: " Hana Musa " },
    });
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: " SALES@APEX.test " },
    });
    fireEvent.change(screen.getByLabelText(/billing address/i), {
      target: { value: " Level 18, Jalan Ampang " },
    });
    fireEvent.click(screen.getByRole("button", { name: /save customer/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: "Apex Trading",
        contactPerson: "Hana Musa",
        email: "sales@apex.test",
        phone: "",
        billingAddress: "Level 18, Jalan Ampang",
        status: "active",
        notes: "",
      });
    });
  });
});
