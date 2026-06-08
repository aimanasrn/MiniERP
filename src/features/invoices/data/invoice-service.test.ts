import {
  buildInvoicePayload,
  calculateInvoiceTotals,
  getInvoiceMetrics,
} from "./invoice-service";

describe("invoice service helpers", () => {
  it("calculates subtotal and total from line items", () => {
    expect(
      calculateInvoiceTotals(
        [
          { quantity: 2, unitPrice: 50 },
          { quantity: 1, unitPrice: 25 },
        ],
        12.5,
      ),
    ).toEqual({
      subtotal: 125,
      taxAmount: 12.5,
      totalAmount: 137.5,
    });
  });

  it("normalizes invoice payloads for persistence", () => {
    expect(
      buildInvoicePayload({
        invoiceNumber: " inv-2031 ",
        customerId: " customer-1 ",
        issueDate: "2026-06-01",
        dueDate: "2026-06-15",
        status: "sent",
        taxAmount: " 12.50 ",
        notes: " Priority account. ",
        items: [
          {
            description: " Subscription renewal ",
            quantity: "2",
            unitPrice: "50",
          },
          {
            description: " Onboarding workshop ",
            quantity: "1",
            unitPrice: "25",
          },
        ],
      }),
    ).toEqual({
      invoice: {
        invoice_number: "INV-2031",
        customer_id: "customer-1",
        issue_date: "2026-06-01",
        due_date: "2026-06-15",
        status: "sent",
        subtotal: "125.00",
        tax_amount: "12.50",
        total_amount: "137.50",
        notes: "Priority account.",
      },
      items: [
        {
          description: "Subscription renewal",
          quantity: "2.00",
          unit_price: "50.00",
          line_total: "100.00",
        },
        {
          description: "Onboarding workshop",
          quantity: "1.00",
          unit_price: "25.00",
          line_total: "25.00",
        },
      ],
    });
  });

  it("summarizes invoice metrics from current records", () => {
    expect(
      getInvoiceMetrics([
        { status: "draft", total_amount: "320.00" },
        { status: "sent", total_amount: "480.50" },
        { status: "paid", total_amount: "950.25" },
        { status: "overdue", total_amount: "210.00" },
        { status: "void", total_amount: "120.00" },
      ]),
    ).toEqual({
      totalInvoices: 5,
      draftInvoices: 1,
      sentInvoices: 1,
      paidInvoices: 1,
      overdueInvoices: 1,
      recognizedRevenue: 950.25,
      outstandingRevenue: 690.5,
    });
  });
});
