import { buildCustomerPayload, getCustomerMetrics } from "./customer-service";

describe("customer service helpers", () => {
  it("normalizes customer creation payloads", () => {
    expect(
      buildCustomerPayload({
        name: "  Apex Trading  ",
        contactPerson: "  Hana Musa  ",
        email: "  SALES@APEX.test  ",
        phone: "  +60 11-234 7777  ",
        billingAddress: "  Level 18, Jalan Ampang  ",
        status: "active",
        notes: "  Key retail expansion account.  ",
      }),
    ).toEqual({
      name: "Apex Trading",
      contact_person: "Hana Musa",
      email: "sales@apex.test",
      phone: "+60 11-234 7777",
      billing_address: "Level 18, Jalan Ampang",
      status: "active",
      notes: "Key retail expansion account.",
    });
  });

  it("summarizes customer counts by status", () => {
    expect(
      getCustomerMetrics([
        { status: "active" },
        { status: "inactive" },
        { status: "active" },
        { status: "archived" },
      ]),
    ).toEqual({
      total: 4,
      active: 2,
      inactive: 1,
      archived: 1,
    });
  });
});
