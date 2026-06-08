import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { InvoiceForm } from "./invoice-form";

describe("InvoiceForm", () => {
  it("submits normalized invoice values", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<InvoiceForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/invoice number/i), {
      target: { value: " inv-2031 " },
    });
    fireEvent.change(screen.getByLabelText(/customer id/i), {
      target: { value: " customer-1 " },
    });
    fireEvent.change(screen.getByLabelText(/issue date/i), {
      target: { value: "2026-06-01" },
    });
    fireEvent.change(screen.getByLabelText(/due date/i), {
      target: { value: "2026-06-15" },
    });
    fireEvent.change(screen.getByLabelText(/tax amount/i), {
      target: { value: "12.5" },
    });
    fireEvent.change(screen.getByLabelText(/line item description/i), {
      target: { value: " Subscription renewal " },
    });
    fireEvent.change(screen.getByLabelText(/quantity/i), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText(/unit price/i), {
      target: { value: "50" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save invoice/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        invoiceNumber: "INV-2031",
        customerId: "customer-1",
        issueDate: "2026-06-01",
        dueDate: "2026-06-15",
        status: "draft",
        taxAmount: "12.50",
        notes: "",
        items: [
          {
            description: "Subscription renewal",
            quantity: "2",
            unitPrice: "50.00",
          },
        ],
      });
    });
  });
});
