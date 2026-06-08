import { validateEmployeeInput } from "./employees";

describe("employee validation", () => {
  it("normalizes valid employee values", () => {
    expect(
      validateEmployeeInput({
        employeeCode: "  emp-009  ",
        fullName: "  Aisha Karim  ",
        workEmail: "  AISHA@ERPFlow.test  ",
        phone: "  +60 12-888 1919  ",
        department: "  Operations  ",
        jobTitle: "  Shift Lead  ",
        hireDate: "2026-05-01",
        status: "active",
        notes: "  Handles regional onboarding.  ",
      }),
    ).toEqual({
      success: true,
      data: {
        employeeCode: "EMP-009",
        fullName: "Aisha Karim",
        workEmail: "aisha@erpflow.test",
        phone: "+60 12-888 1919",
        department: "Operations",
        jobTitle: "Shift Lead",
        hireDate: "2026-05-01",
        status: "active",
        notes: "Handles regional onboarding.",
      },
    });
  });

  it("rejects incomplete employee values", () => {
    expect(
      validateEmployeeInput({
        employeeCode: "",
        fullName: "",
        workEmail: "not-an-email",
        phone: "",
        department: "",
        jobTitle: "",
        hireDate: "",
        status: "active",
        notes: "",
      }),
    ).toEqual({
      success: false,
      errors: {
        employeeCode: "Enter an employee code.",
        fullName: "Enter the employee name.",
        workEmail: "Enter a valid work email.",
        department: "Enter the employee department.",
        jobTitle: "Enter the employee job title.",
        hireDate: "Enter the employee hire date.",
      },
    });
  });
});
