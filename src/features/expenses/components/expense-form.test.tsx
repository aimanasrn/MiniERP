import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { ExpenseForm } from "./expense-form";

describe("ExpenseForm", () => {
  it("submits normalized expense values", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<ExpenseForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/expense date/i), {
      target: { value: "2026-06-05" },
    });
    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: " Travel " },
    });
    fireEvent.change(screen.getByLabelText(/vendor/i), {
      target: { value: " Railink Mobility " },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: " Sales trip to Penang " },
    });
    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: "480.5" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save expense/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        expenseDate: "2026-06-05",
        category: "Travel",
        vendor: "Railink Mobility",
        description: "Sales trip to Penang",
        amount: "480.50",
        status: "draft",
        notes: "",
      });
    });
  });
});
