import { buildExpensePayload, getExpenseMetrics } from "./expense-service";

describe("expense service helpers", () => {
  it("normalizes expense payloads for persistence", () => {
    expect(
      buildExpensePayload({
        expenseDate: "2026-06-05",
        category: " Travel ",
        vendor: " Railink Mobility ",
        description: " Sales trip to Penang ",
        amount: " 480.5 ",
        status: "submitted",
        notes: " Awaiting finance review. ",
      }),
    ).toEqual({
      expense_date: "2026-06-05",
      category: "Travel",
      vendor: "Railink Mobility",
      description: "Sales trip to Penang",
      amount: "480.50",
      status: "submitted",
      notes: "Awaiting finance review.",
    });
  });

  it("summarizes expense metrics by status and spend", () => {
    expect(
      getExpenseMetrics([
        { status: "draft", amount: "560.00" },
        { status: "submitted", amount: "480.50" },
        { status: "approved", amount: "220.00" },
        { status: "paid", amount: "95.80" },
        { status: "rejected", amount: "40.00" },
      ]),
    ).toEqual({
      totalExpenses: 5,
      totalSpend: 1396.3,
      draft: 1,
      submitted: 1,
      approved: 1,
      rejected: 1,
      paid: 1,
    });
  });
});
