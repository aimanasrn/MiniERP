import {
  buildReportSeries,
  summarizeFinance,
  type FinanceSnapshot,
} from "./report-service";

describe("report service helpers", () => {
  it("summarizes invoice and expense totals into net performance", () => {
    expect(summarizeFinance([1250.5, 750], [420.25, 310])).toEqual({
      invoiceTotal: 2000.5,
      expenseTotal: 730.25,
      net: 1270.25,
      marginPercentage: 63.5,
    });
  });

  it("builds sorted report series from finance snapshots", () => {
    const snapshots: FinanceSnapshot[] = [
      { label: "May", invoices: [820], expenses: [410, 55] },
      { label: "Apr", invoices: [500, 150], expenses: [200] },
      { label: "Jun", invoices: [1100, 250], expenses: [420, 180] },
    ];

    expect(buildReportSeries(snapshots)).toEqual([
      { label: "Apr", invoiceTotal: 650, expenseTotal: 200, net: 450 },
      { label: "May", invoiceTotal: 820, expenseTotal: 465, net: 355 },
      { label: "Jun", invoiceTotal: 1350, expenseTotal: 600, net: 750 },
    ]);
  });
});
