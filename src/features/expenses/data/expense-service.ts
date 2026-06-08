import type { Database } from "@/types/database";
import type { ExpenseValues } from "@/lib/validations/expenses";

type ExpenseInsert = Database["public"]["Tables"]["expenses"]["Insert"];
type ExpenseMetricRecord = Pick<
  Database["public"]["Tables"]["expenses"]["Row"],
  "status" | "amount"
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

export function buildExpensePayload(
  input: ExpenseValues,
): Omit<ExpenseInsert, "company_id"> {
  return {
    expense_date: input.expenseDate,
    category: normalizeValue(input.category),
    vendor: normalizeValue(input.vendor) || null,
    description: normalizeValue(input.description),
    amount: formatMoney(parseMoney(input.amount)),
    status: input.status,
    notes: normalizeValue(input.notes) || null,
  };
}

export function getExpenseMetrics(records: readonly ExpenseMetricRecord[]) {
  return records.reduce(
    (summary, record) => {
      const amount = parseMoney(record.amount);

      summary.totalExpenses += 1;
      summary.totalSpend += amount;
      summary[record.status] += 1;

      return summary;
    },
    {
      totalExpenses: 0,
      totalSpend: 0,
      draft: 0,
      submitted: 0,
      approved: 0,
      rejected: 0,
      paid: 0,
    },
  );
}
