export type FinanceSnapshot = {
  label: string;
  invoices: number[];
  expenses: number[];
};

const monthOrder = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function summarizeFinance(invoices: number[], expenses: number[]) {
  const invoiceTotal = invoices.reduce((sum, value) => sum + value, 0);
  const expenseTotal = expenses.reduce((sum, value) => sum + value, 0);
  const net = invoiceTotal - expenseTotal;
  const marginPercentage = invoiceTotal > 0 ? (net / invoiceTotal) * 100 : 0;

  return {
    invoiceTotal,
    expenseTotal,
    net,
    marginPercentage: Number(marginPercentage.toFixed(1)),
  };
}

export function buildReportSeries(snapshots: FinanceSnapshot[]) {
  return [...snapshots]
    .sort(
      (left, right) =>
        monthOrder.indexOf(left.label as (typeof monthOrder)[number]) -
        monthOrder.indexOf(right.label as (typeof monthOrder)[number]),
    )
    .map((snapshot) => {
      const summary = summarizeFinance(snapshot.invoices, snapshot.expenses);

      return {
        label: snapshot.label,
        invoiceTotal: summary.invoiceTotal,
        expenseTotal: summary.expenseTotal,
        net: summary.net,
      };
    });
}
