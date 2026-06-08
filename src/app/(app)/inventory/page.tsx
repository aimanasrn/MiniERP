import React from "react";

import { DataTable } from "@/components/shared/data-table";
import { FilterBar } from "@/components/shared/filter-bar";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProductForm } from "@/features/inventory/components/product-form";
import {
  getInventoryMetrics,
  isLowStock,
} from "@/features/inventory/data/product-service";
import { requireRouteAccess } from "@/lib/auth/guards";
import type { ProductStatus } from "@/types/database";

const products: Array<{
  sku: string;
  name: string;
  category: string;
  unit_price: string;
  stock_quantity: number;
  reorder_threshold: number;
  status: ProductStatus;
}> = [
  {
    sku: "SK-1001",
    name: "Smart Scanner",
    category: "Hardware",
    unit_price: "249.90",
    stock_quantity: 6,
    reorder_threshold: 10,
    status: "active",
  },
  {
    sku: "SK-1032",
    name: "Thermal Labels",
    category: "Consumables",
    unit_price: "29.50",
    stock_quantity: 9,
    reorder_threshold: 3,
    status: "active",
  },
  {
    sku: "SK-0908",
    name: "Legacy Dock",
    category: "Accessories",
    unit_price: "59.00",
    stock_quantity: 0,
    reorder_threshold: 2,
    status: "archived",
  },
];

export default async function InventoryPage() {
  await requireRouteAccess("/inventory");

  const metrics = getInventoryMetrics(products);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Inventory manager lane"
        title="Inventory control center"
        description="Monitor stock exposure, catalog health, and reorder pressure with a warehouse-ready command surface."
      />

      <section
        aria-label="Inventory metrics"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard label="Products tracked" value={String(metrics.totalProducts)} detail="All active and archived SKUs in view." />
        <StatCard label="Active catalog" value={String(metrics.activeProducts)} detail="Products currently offered for operations." />
        <StatCard label="Low-stock alerts" value={String(metrics.lowStockProducts)} change="Needs buyer attention" />
        <StatCard label="Archived SKUs" value={String(metrics.archivedProducts)} detail="Inactive catalog retained for lifecycle history." />
      </section>

      <FilterBar
        searchPlaceholder="Search products by SKU, name, or category"
        filters={(
          <>
            <StatusBadge label="Warehouse synced" tone="info" />
            <StatusBadge label={`${metrics.lowStockProducts} low-stock`} tone="warning" />
          </>
        )}
        actions={<button className="button-primary" type="button">Export stocklist</button>}
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="rounded-[22px] border border-[var(--line)] bg-[rgba(15,29,53,0.88)] p-5 shadow-[var(--shadow-md)]">
            <p className="page-header__eyebrow">Stock watchlist</p>
            <h3 className="m-0 text-2xl tracking-[-0.03em] text-[var(--text)]">
              Inventory pressure by reorder threshold
            </h3>
            <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
              Highlight the SKUs most likely to affect purchasing and order fulfillment next.
            </p>
          </div>

          <DataTable
            caption="Inventory table with low-stock signal."
            columns={["SKU", "Product", "Category", "Unit price", "Stock", "Status"]}
            rows={products.map((product) => [
              product.sku,
              product.name,
              product.category,
              `RM ${product.unit_price}`,
              `${product.stock_quantity} units`,
              <div key={`${product.sku}-signals`} className="flex flex-wrap gap-2">
                <StatusBadge
                  label={product.status}
                  tone={
                    product.status === "active"
                      ? "success"
                      : product.status === "inactive"
                        ? "warning"
                        : "neutral"
                  }
                />
                {product.status !== "archived" &&
                isLowStock(product.stock_quantity, product.reorder_threshold) ? (
                  <StatusBadge label="Low-stock alert" tone="warning" />
                ) : null}
              </div>,
            ])}
          />
        </div>

        <ProductForm />
      </section>
    </div>
  );
}
