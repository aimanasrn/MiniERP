import { validateExpenseInput } from "./expenses";

describe("expense validation", () => {
  it("normalizes valid expense values", () => {
    expect(
      validateExpenseInput({
        expenseDate: "2026-06-05",
        category: " Travel ",
        vendor: " Railink Mobility ",
        description: " Sales trip to Penang ",
        amount: " 480.50 ",
        status: "submitted",
        notes: " Awaiting finance review. ",
      }),
    ).toEqual({
      success: true,
      data: {
        expenseDate: "2026-06-05",
        category: "Travel",
        vendor: "Railink Mobility",
        description: "Sales trip to Penang",
        amount: "480.50",
        status: "submitted",
        notes: "Awaiting finance review.",
      },
    });
  });

  it("rejects incomplete expense values", () => {
    expect(
      validateExpenseInput({
        expenseDate: "",
        category: "",
        vendor: "",
        description: "",
        amount: "0",
        status: "draft",
        notes: "",
      }),
    ).toEqual({
      success: false,
      errors: {
        expenseDate: "Enter the expense date.",
        category: "Enter the expense category.",
        description: "Enter the expense description.",
        amount: "Use an amount greater than zero.",
      },
    });
  });
});
