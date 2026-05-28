import { toCompanySetupUpdate } from "./company-service";

describe("company service helpers", () => {
  it("maps validated setup values into the company update payload", () => {
    expect(
      toCompanySetupUpdate({
        name: "Northwind Foods",
        industry: "Distribution",
        country: "Malaysia",
        currencyCode: "MYR",
        timezone: "Asia/Kuala_Lumpur",
      }),
    ).toEqual({
      name: "Northwind Foods",
      industry: "Distribution",
      country: "Malaysia",
      currency_code: "MYR",
      timezone: "Asia/Kuala_Lumpur",
    });
  });
});
