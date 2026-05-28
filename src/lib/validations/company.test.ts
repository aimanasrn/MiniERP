import { validateCompanySetupInput } from "./company";

describe("company setup validation", () => {
  it("normalizes valid company setup values", () => {
    expect(
      validateCompanySetupInput({
        name: "  Northwind Foods  ",
        industry: " Distribution ",
        country: " Malaysia ",
        currencyCode: "myr",
        timezone: "Asia/Kuala_Lumpur",
      }),
    ).toEqual({
      success: true,
      data: {
        name: "Northwind Foods",
        industry: "Distribution",
        country: "Malaysia",
        currencyCode: "MYR",
        timezone: "Asia/Kuala_Lumpur",
      },
    });
  });

  it("rejects incomplete company setup values", () => {
    expect(
      validateCompanySetupInput({
        name: "",
        industry: "",
        country: "",
        currencyCode: "rm",
        timezone: "",
      }),
    ).toEqual({
      success: false,
      errors: {
        name: "Enter the company name.",
        industry: "Enter the primary industry.",
        country: "Enter the operating country.",
        currencyCode: "Use a 3-letter currency code.",
        timezone: "Enter the primary timezone.",
      },
    });
  });
});
