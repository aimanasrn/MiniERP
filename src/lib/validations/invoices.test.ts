import { validateInvoiceInput } from "./invoices";

describe("invoice validation", () => {
  it("normalizes valid invoice values", () => {
    expect(
      validateInvoiceInput({
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
        ],
      }),
    ).toEqual({
      success: true,
      data: {
        invoiceNumber: "INV-2031",
        customerId: "customer-1",
        issueDate: "2026-06-01",
        dueDate: "2026-06-15",
        status: "sent",
        taxAmount: "12.50",
        notes: "Priority account.",
        items: [
          {
            description: "Subscription renewal",
            quantity: "2",
            unitPrice: "50.00",
          },
        ],
      },
    });
  });

  it("rejects incomplete invoice values", () => {
    expect(
      validateInvoiceInput({
        invoiceNumber: "",
        customerId: "",
        issueDate: "",
        dueDate: "",
        status: "draft",
        taxAmount: "-1",
        notes: "",
        items: [
          {
            description: "",
            quantity: "0",
            unitPrice: "-5",
          },
        ],
      }),
    ).toEqual({
      success: false,
      errors: {
        invoiceNumber: "Enter the invoice number.",
        customerId: "Select the billed customer.",
        issueDate: "Enter the invoice issue date.",
        dueDate: "Enter the invoice due date.",
        taxAmount: "Tax amount cannot be negative.",
        "items.0.description": "Enter a line item description.",
        "items.0.quantity": "Use a quantity greater than zero.",
        "items.0.unitPrice": "Use a valid unit price.",
      },
    });
  });

  it("rejects due dates before the issue date", () => {
    expect(
      validateInvoiceInput({
        invoiceNumber: "INV-3001",
        customerId: "customer-1",
        issueDate: "2026-06-15",
        dueDate: "2026-06-01",
        status: "draft",
        taxAmount: "0",
        notes: "",
        items: [
          {
            description: "Subscription renewal",
            quantity: "1",
            unitPrice: "125",
          },
        ],
      }),
    ).toEqual({
      success: false,
      errors: {
        dueDate: "Due date cannot be earlier than the issue date.",
      },
    });
  });
});
