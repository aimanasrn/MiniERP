import type { Database } from "@/types/database";
import type { EmployeeValues } from "@/lib/validations/employees";

type EmployeeInsert = Database["public"]["Tables"]["employees"]["Insert"];
type EmployeeMetricRecord = Pick<
  Database["public"]["Tables"]["employees"]["Row"],
  "hire_date" | "status"
>;

function normalizeValue(value: string) {
  return value.trim();
}

export function buildEmployeePayload(input: EmployeeValues): Omit<EmployeeInsert, "company_id"> {
  return {
    employee_code: normalizeValue(input.employeeCode).toUpperCase(),
    full_name: normalizeValue(input.fullName),
    work_email: normalizeValue(input.workEmail).toLowerCase(),
    phone: normalizeValue(input.phone) || null,
    department: normalizeValue(input.department),
    job_title: normalizeValue(input.jobTitle),
    hire_date: normalizeValue(input.hireDate),
    status: input.status,
    notes: normalizeValue(input.notes) || null,
  };
}

function isRecentHire(hireDate: string | null, referenceDate: string) {
  if (!hireDate) {
    return false;
  }

  const hireTimestamp = Date.parse(hireDate);
  const referenceTimestamp = Date.parse(referenceDate);

  if (Number.isNaN(hireTimestamp) || Number.isNaN(referenceTimestamp)) {
    return false;
  }

  const daysSinceHire = (referenceTimestamp - hireTimestamp) / (1000 * 60 * 60 * 24);

  return daysSinceHire >= 0 && daysSinceHire <= 30;
}

export function getEmployeeMetrics(
  records: readonly EmployeeMetricRecord[],
  referenceDate = new Date().toISOString().slice(0, 10),
) {
  return records.reduce(
    (summary, record) => {
      summary.total += 1;

      if (record.status === "active") {
        summary.active += 1;
      } else if (record.status === "inactive") {
        summary.inactive += 1;
      } else if (record.status === "terminated") {
        summary.terminated += 1;
      }

      if (isRecentHire(record.hire_date, referenceDate)) {
        summary.newHires += 1;
      }

      return summary;
    },
    {
      total: 0,
      active: 0,
      inactive: 0,
      terminated: 0,
      newHires: 0,
    },
  );
}
