import { buildProductPayload, getInventoryMetrics, isLowStock } from "./product-service";

describe("product service helpers", () => {
  it("normalizes product payloads for persistence", () => {
    expect(
      buildProductPayload({
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
      sku: "SK-1001",
      name: "Smart Scanner",
      description: "Handheld intake scanner.",
      category: "Hardware",
      unit_price: "249.90",
      stock_quantity: 12,
      reorder_threshold: 5,
      status: "active",
    });
  });

  it("flags stock at or below the reorder threshold", () => {
    expect(isLowStock(5, 5)).toBe(true);
    expect(isLowStock(6, 5)).toBe(false);
  });

  it("calculates inventory metrics from product records", () => {
    expect(
      getInventoryMetrics([
        { reorder_threshold: 10, status: "active", stock_quantity: 6 },
        { reorder_threshold: 3, status: "active", stock_quantity: 9 },
        { reorder_threshold: 2, status: "archived", stock_quantity: 0 },
      ]),
    ).toEqual({
      totalProducts: 3,
      activeProducts: 2,
      archivedProducts: 1,
      lowStockProducts: 1,
      stockUnits: 15,
    });
  });

  it("does not count archived products as buyer-facing low-stock alerts", () => {
    expect(
      getInventoryMetrics([
        { reorder_threshold: 10, status: "archived", stock_quantity: 1 },
      ]),
    ).toEqual({
      totalProducts: 1,
      activeProducts: 0,
      archivedProducts: 1,
      lowStockProducts: 0,
      stockUnits: 1,
    });
  });
});
