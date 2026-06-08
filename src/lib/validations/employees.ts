import type { EmployeeStatus } from "@/types/database";

export type EmployeeInput = {
  employeeCode: string;
  fullName: string;
  workEmail: string;
  phone: string;
  department: string;
  jobTitle: string;
  hireDate: string;
  status: EmployeeStatus;
  notes: string;
};

export type EmployeeValues = EmployeeInput;

export type EmployeeValidationResult =
  | {
      success: true;
      data: EmployeeValues;
    }
  | {
      success: false;
      errors: Record<string, string>;
    };

function normalizeValue(value: string) {
  return value.trim();
}

function normalizeOptionalValue(value: string) {
  return normalizeValue(value);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateEmployeeInput(input: EmployeeInput): EmployeeValidationResult {
  const data: EmployeeValues = {
    employeeCode: normalizeValue(input.employeeCode).toUpperCase(),
    fullName: normalizeValue(input.fullName),
    workEmail: normalizeValue(input.workEmail).toLowerCase(),
    phone: normalizeOptionalValue(input.phone),
    department: normalizeValue(input.department),
    jobTitle: normalizeValue(input.jobTitle),
    hireDate: normalizeValue(input.hireDate),
    status: input.status,
    notes: normalizeOptionalValue(input.notes),
  };
  const errors: Record<string, string> = {};

  if (!data.employeeCode) {
    errors.employeeCode = "Enter an employee code.";
  }

  if (!data.fullName) {
    errors.fullName = "Enter the employee name.";
  }

  if (!isValidEmail(data.workEmail)) {
    errors.workEmail = "Enter a valid work email.";
  }

  if (!data.department) {
    errors.department = "Enter the employee department.";
  }

  if (!data.jobTitle) {
    errors.jobTitle = "Enter the employee job title.";
  }

  if (!data.hireDate) {
    errors.hireDate = "Enter the employee hire date.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    data,
  };
}
