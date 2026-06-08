import { validateProductInput } from "./products";

describe("product validation", () => {
  it("normalizes valid product values", () => {
    expect(
      validateProductInput({
        sku: "  sk-1001  ",
        name: "  Smart Scanner  ",
        description: "  Handheld intake scanner.  ",
        category: "  Hardware  ",
        unitPrice: " 249.90 ",
        stockQuantity: "12",
        reorderThreshold: "5",
        status: "active",
      }),
    ).toEqual({
      success: true,
      data: {
        sku: "SK-1001",
        name: "Smart Scanner",
        description: "Handheld intake scanner.",
        category: "Hardware",
        unitPrice: "249.90",
        stockQuantity: "12",
        reorderThreshold: "5",
        status: "active",
      },
    });
  });

  it("rejects invalid product values", () => {
    expect(
      validateProductInput({
        sku: "",
        name: "",
        description: "",
        category: "",
        unitPrice: "abc",
        stockQuantity: "-1",
        reorderThreshold: "x",
        status: "active",
      }),
    ).toEqual({
      success: false,
      errors: {
        sku: "Enter a SKU.",
        name: "Enter the product name.",
        category: "Enter a product category.",
        unitPrice: "Enter a valid unit price.",
        stockQuantity: "Enter a valid stock quantity.",
        reorderThreshold: "Enter a valid reorder threshold.",
      },
    });
  });
});
