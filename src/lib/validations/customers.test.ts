import { validateCustomerInput } from "./customers";

describe("customer validation", () => {
  it("normalizes valid customer values", () => {
    expect(
      validateCustomerInput({
        name: "  Apex Trading  ",
        contactPerson: "  Hana Musa  ",
        email: "  SALES@APEX.test  ",
        phone: "  +60 11-234 7777  ",
        billingAddress: "  Level 18, Jalan Ampang  ",
        status: "active",
        notes: "  Key retail expansion account.  ",
      }),
    ).toEqual({
      success: true,
      data: {
        name: "Apex Trading",
        contactPerson: "Hana Musa",
        email: "sales@apex.test",
        phone: "+60 11-234 7777",
        billingAddress: "Level 18, Jalan Ampang",
        status: "active",
        notes: "Key retail expansion account.",
      },
    });
  });

  it("rejects invalid customer values", () => {
    expect(
      validateCustomerInput({
        name: "",
        contactPerson: "",
        email: "bad-email",
        phone: "",
        billingAddress: "",
        status: "active",
        notes: "",
      }),
    ).toEqual({
      success: false,
      errors: {
        name: "Enter the customer name.",
        contactPerson: "Enter the primary contact.",
        email: "Enter a valid customer email.",
        billingAddress: "Enter the billing address.",
      },
    });
  });
});
