import { buildEmployeePayload, getEmployeeMetrics } from "./employee-service";

describe("employee service helpers", () => {
  it("normalizes employee creation payloads", () => {
    expect(
      buildEmployeePayload({
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
      employee_code: "EMP-009",
      full_name: "Aisha Karim",
      work_email: "aisha@erpflow.test",
      phone: "+60 12-888 1919",
      department: "Operations",
      job_title: "Shift Lead",
      hire_date: "2026-05-01",
      status: "active",
      notes: "Handles regional onboarding.",
    });
  });

  it("summarizes active, inactive, and new hires from employee records", () => {
    expect(
      getEmployeeMetrics(
        [
          { hire_date: "2026-06-01", status: "active" },
          { hire_date: "2026-01-15", status: "inactive" },
          { hire_date: "2026-06-03", status: "active" },
          { hire_date: "2025-12-30", status: "terminated" },
        ],
        "2026-06-15",
      ),
    ).toEqual({
      total: 4,
      active: 2,
      inactive: 1,
      terminated: 1,
      newHires: 2,
    });
  });

  it("uses the supplied reference date for new-hire windows", () => {
    expect(
      getEmployeeMetrics(
        [
          { hire_date: "2026-05-20", status: "active" },
          { hire_date: "2026-04-10", status: "active" },
        ],
        "2026-06-15",
      ),
    ).toEqual({
      total: 2,
      active: 2,
      inactive: 0,
      terminated: 0,
      newHires: 1,
    });
  });
});
