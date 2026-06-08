import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { ProductForm } from "./product-form";

describe("ProductForm", () => {
  it("submits normalized product values", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<ProductForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/^sku$/i), {
      target: { value: " sk-1001 " },
    });
    fireEvent.change(screen.getByLabelText(/product name/i), {
      target: { value: " Smart Scanner " },
    });
    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: " Hardware " },
    });
    fireEvent.change(screen.getByLabelText(/unit price/i), {
      target: { value: " 249.90 " },
    });
    fireEvent.change(screen.getByLabelText(/stock quantity/i), {
      target: { value: "12" },
    });
    fireEvent.change(screen.getByLabelText(/reorder threshold/i), {
      target: { value: "5" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save product/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        sku: "SK-1001",
        name: "Smart Scanner",
        description: "",
        category: "Hardware",
        unitPrice: "249.90",
        stockQuantity: "12",
        reorderThreshold: "5",
        status: "active",
      });
    });
  });
});
