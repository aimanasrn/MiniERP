import type { Database } from "@/types/database";
import type { ProductValues } from "@/lib/validations/products";

type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductMetricRecord = Pick<
  Database["public"]["Tables"]["products"]["Row"],
  "reorder_threshold" | "status" | "stock_quantity"
>;

function normalizeValue(value: string) {
  return value.trim();
}

export function buildProductPayload(input: ProductValues): Omit<ProductInsert, "company_id"> {
  return {
    sku: normalizeValue(input.sku).toUpperCase(),
    name: normalizeValue(input.name),
    description: normalizeValue(input.description) || null,
    category: normalizeValue(input.category),
    unit_price: normalizeValue(input.unitPrice),
    stock_quantity: Number(normalizeValue(input.stockQuantity)),
    reorder_threshold: Number(normalizeValue(input.reorderThreshold)),
    status: input.status,
  };
}

export function isLowStock(stockQuantity: number, reorderThreshold: number) {
  return stockQuantity <= reorderThreshold;
}

export function getInventoryMetrics(records: readonly ProductMetricRecord[]) {
  return records.reduce(
    (summary, record) => {
      summary.totalProducts += 1;
      summary.stockUnits += record.stock_quantity;

      if (record.status === "active") {
        summary.activeProducts += 1;
      }

      if (record.status === "archived") {
        summary.archivedProducts += 1;
      }

      if (
        record.status !== "archived" &&
        isLowStock(record.stock_quantity, record.reorder_threshold)
      ) {
        summary.lowStockProducts += 1;
      }

      return summary;
    },
    {
      totalProducts: 0,
      activeProducts: 0,
      archivedProducts: 0,
      lowStockProducts: 0,
      stockUnits: 0,
    },
  );
}
