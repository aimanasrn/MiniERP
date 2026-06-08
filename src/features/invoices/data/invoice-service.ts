import type { Database } from "@/types/database";
import type { InvoiceValues } from "@/lib/validations/invoices";

type InvoiceInsert = Database["public"]["Tables"]["invoices"]["Insert"];
type InvoiceItemInsert = Database["public"]["Tables"]["invoice_items"]["Insert"];
type InvoiceLineInput = {
  quantity: number;
  unitPrice: number;
};
type InvoiceMetricRecord = Pick<
  Database["public"]["Tables"]["invoices"]["Row"],
  "status" | "total_amount"
>;

function normalizeValue(value: string) {
  return value.trim();
}

function formatMoney(value: number) {
  return value.toFixed(2);
}

function parseMoney(value: string) {
  return Number(value);
}

export function calculateInvoiceTotals(items: InvoiceLineInput[], taxAmount: number) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  return {
    subtotal,
    taxAmount,
    totalAmount: subtotal + taxAmount,
  };
}

export function buildInvoicePayload(input: InvoiceValues): {
  invoice: Omit<InvoiceInsert, "company_id">;
  items: Array<Omit<InvoiceItemInsert, "company_id" | "invoice_id">>;
} {
  const normalizedItems = input.items.map((item) => {
    const quantity = parseMoney(item.quantity);
    const unitPrice = parseMoney(item.unitPrice);
    const lineTotal = quantity * unitPrice;

    return {
      description: normalizeValue(item.description),
      quantity: formatMoney(quantity),
      unit_price: formatMoney(unitPrice),
      line_total: formatMoney(lineTotal),
    };
  });
  const totals = calculateInvoiceTotals(
    normalizedItems.map((item) => ({
      quantity: parseMoney(item.quantity),
      unitPrice: parseMoney(item.unit_price),
    })),
    parseMoney(input.taxAmount),
  );

  return {
    invoice: {
      invoice_number: normalizeValue(input.invoiceNumber).toUpperCase(),
      customer_id: normalizeValue(input.customerId),
      issue_date: input.issueDate,
      due_date: input.dueDate,
      status: input.status,
      subtotal: formatMoney(totals.subtotal),
      tax_amount: formatMoney(totals.taxAmount),
      total_amount: formatMoney(totals.totalAmount),
      notes: normalizeValue(input.notes) || null,
    },
    items: normalizedItems,
  };
}

export function getInvoiceMetrics(records: readonly InvoiceMetricRecord[]) {
  return records.reduce(
    (summary, record) => {
      const totalAmount = parseMoney(record.total_amount);

      summary.totalInvoices += 1;

      if (record.status === "draft") {
        summary.draftInvoices += 1;
      }

      if (record.status === "sent") {
        summary.sentInvoices += 1;
        summary.outstandingRevenue += totalAmount;
      }

      if (record.status === "paid") {
        summary.paidInvoices += 1;
        summary.recognizedRevenue += totalAmount;
      }

      if (record.status === "overdue") {
        summary.overdueInvoices += 1;
        summary.outstandingRevenue += totalAmount;
      }

      return summary;
    },
    {
      totalInvoices: 0,
      draftInvoices: 0,
      sentInvoices: 0,
      paidInvoices: 0,
      overdueInvoices: 0,
      recognizedRevenue: 0,
      outstandingRevenue: 0,
    },
  );
}
