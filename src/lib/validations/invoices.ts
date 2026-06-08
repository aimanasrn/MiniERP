import type { InvoiceStatus } from "@/types/database";

export type InvoiceLineItemInput = {
  description: string;
  quantity: string;
  unitPrice: string;
};

export type InvoiceInput = {
  invoiceNumber: string;
  customerId: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  taxAmount: string;
  notes: string;
  items: InvoiceLineItemInput[];
};

export type InvoiceValues = InvoiceInput;

export type InvoiceValidationResult =
  | {
      success: true;
      data: InvoiceValues;
    }
  | {
      success: false;
      errors: Record<string, string>;
    };

function normalizeValue(value: string) {
  return value.trim();
}

function normalizeMoney(value: string) {
  const normalized = normalizeValue(value);
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    return normalized;
  }

  return parsed.toFixed(2);
}

export function validateInvoiceInput(input: InvoiceInput): InvoiceValidationResult {
  const data: InvoiceValues = {
    invoiceNumber: normalizeValue(input.invoiceNumber).toUpperCase(),
    customerId: normalizeValue(input.customerId),
    issueDate: normalizeValue(input.issueDate),
    dueDate: normalizeValue(input.dueDate),
    status: input.status,
    taxAmount: normalizeMoney(input.taxAmount || "0"),
    notes: normalizeValue(input.notes),
    items: input.items.map((item) => ({
      description: normalizeValue(item.description),
      quantity: normalizeValue(item.quantity),
      unitPrice: normalizeMoney(item.unitPrice),
    })),
  };
  const errors: Record<string, string> = {};

  if (!data.invoiceNumber) {
    errors.invoiceNumber = "Enter the invoice number.";
  }

  if (!data.customerId) {
    errors.customerId = "Select the billed customer.";
  }

  if (!data.issueDate) {
    errors.issueDate = "Enter the invoice issue date.";
  }

  if (!data.dueDate) {
    errors.dueDate = "Enter the invoice due date.";
  }

  if (
    data.issueDate &&
    data.dueDate &&
    !Number.isNaN(Date.parse(data.issueDate)) &&
    !Number.isNaN(Date.parse(data.dueDate)) &&
    Date.parse(data.dueDate) < Date.parse(data.issueDate)
  ) {
    errors.dueDate = "Due date cannot be earlier than the issue date.";
  }

  if (Number(data.taxAmount) < 0 || Number.isNaN(Number(data.taxAmount))) {
    errors.taxAmount = "Tax amount cannot be negative.";
  }

  if (data.items.length === 0) {
    errors.items = "Add at least one invoice line item.";
  }

  data.items.forEach((item, index) => {
    if (!item.description) {
      errors[`items.${index}.description`] = "Enter a line item description.";
    }

    if (Number(item.quantity) <= 0 || Number.isNaN(Number(item.quantity))) {
      errors[`items.${index}.quantity`] = "Use a quantity greater than zero.";
    }

    if (Number(item.unitPrice) < 0 || Number.isNaN(Number(item.unitPrice))) {
      errors[`items.${index}.unitPrice`] = "Use a valid unit price.";
    }
  });

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    data,
  };
}
