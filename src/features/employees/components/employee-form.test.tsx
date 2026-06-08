import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { EmployeeForm } from "./employee-form";

describe("EmployeeForm", () => {
  it("submits normalized employee values", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<EmployeeForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/employee code/i), {
      target: { value: " emp-009 " },
    });
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: " Aisha Karim " },
    });
    fireEvent.change(screen.getByLabelText(/work email/i), {
      target: { value: " AISHA@ERPFlow.test " },
    });
    fireEvent.change(screen.getByLabelText(/department/i), {
      target: { value: " Operations " },
    });
    fireEvent.change(screen.getByLabelText(/job title/i), {
      target: { value: " Shift Lead " },
    });
    fireEvent.change(screen.getByLabelText(/hire date/i), {
      target: { value: "2026-05-01" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save employee/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        employeeCode: "EMP-009",
        fullName: "Aisha Karim",
        workEmail: "aisha@erpflow.test",
        phone: "",
        department: "Operations",
        jobTitle: "Shift Lead",
        hireDate: "2026-05-01",
        status: "active",
        notes: "",
      });
    });
  });
});
