import type { ExpenseStatus } from "@/types/database";

export type ExpenseInput = {
  expenseDate: string;
  category: string;
  vendor: string;
  description: string;
  amount: string;
  status: ExpenseStatus;
  notes: string;
};

export type ExpenseValues = ExpenseInput;

export type ExpenseValidationResult =
  | {
      success: true;
      data: ExpenseValues;
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

export function validateExpenseInput(input: ExpenseInput): ExpenseValidationResult {
  const data: ExpenseValues = {
    expenseDate: normalizeValue(input.expenseDate),
    category: normalizeValue(input.category),
    vendor: normalizeValue(input.vendor),
    description: normalizeValue(input.description),
    amount: normalizeMoney(input.amount),
    status: input.status,
    notes: normalizeValue(input.notes),
  };
  const errors: Record<string, string> = {};

  if (!data.expenseDate) {
    errors.expenseDate = "Enter the expense date.";
  }

  if (!data.category) {
    errors.category = "Enter the expense category.";
  }

  if (!data.description) {
    errors.description = "Enter the expense description.";
  }

  if (Number(data.amount) <= 0 || Number.isNaN(Number(data.amount))) {
    errors.amount = "Use an amount greater than zero.";
  }

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
