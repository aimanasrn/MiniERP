import React from "react";

import { DataTable } from "@/components/shared/data-table";
import { FilterBar } from "@/components/shared/filter-bar";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmployeeForm } from "@/features/employees/components/employee-form";
import { getEmployeeMetrics } from "@/features/employees/data/employee-service";
import { requireRouteAccess } from "@/lib/auth/guards";

const employees = [
  {
    employee_code: "EMP-009",
    full_name: "Aisha Karim",
    department: "Operations",
    job_title: "Shift Lead",
    work_email: "aisha@erpflow.test",
    hire_date: "2026-06-01",
    status: "active",
  },
  {
    employee_code: "EMP-014",
    full_name: "Daniel Ong",
    department: "People Ops",
    job_title: "Recruiter",
    work_email: "daniel@erpflow.test",
    hire_date: "2026-01-15",
    status: "inactive",
  },
  {
    employee_code: "EMP-018",
    full_name: "Nurul Azhar",
    department: "Support",
    job_title: "Escalation Analyst",
    work_email: "nurul@erpflow.test",
    hire_date: "2026-06-03",
    status: "active",
  },
] as const;

export default async function EmployeesPage() {
  await requireRouteAccess("/employees");

  const metrics = getEmployeeMetrics(employees, "2026-06-15");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="HR manager lane"
        title="Employee operations hub"
        description="Run onboarding, headcount visibility, and team record hygiene from one focused workspace."
      />

      <section
        aria-label="Employee metrics"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard label="Total headcount" value={String(metrics.total)} detail="Live employee records tracked in this slice." />
        <StatCard label="Active teammates" value={String(metrics.active)} change="+2 this month" />
        <StatCard label="Inactive profiles" value={String(metrics.inactive)} detail="Profiles currently paused but still recoverable." />
        <StatCard label="Terminated records" value={String(metrics.terminated)} detail="Separated from inactive to preserve workforce history." />
        <StatCard label="New hires" value={String(metrics.newHires)} detail="Fresh joiners added within the last 30 days." />
      </section>

      <FilterBar
        searchPlaceholder="Search employees by code, name, or department"
        filters={(
          <>
            <StatusBadge label="HR owned" tone="info" />
            <StatusBadge label="2 onboarding" tone="warning" />
          </>
        )}
        actions={<button className="button-primary" type="button">Sync org chart</button>}
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="rounded-[22px] border border-[var(--line)] bg-[rgba(15,29,53,0.88)] p-5 shadow-[var(--shadow-md)]">
            <p className="page-header__eyebrow">Team roster</p>
            <h3 className="m-0 text-2xl tracking-[-0.03em] text-[var(--text)]">
              Coverage across active departments
            </h3>
            <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
              Spot staffing gaps quickly while the rest of the MVP modules come online.
            </p>
          </div>

          <DataTable
            caption="Employee roster with status and role coverage."
            columns={["Code", "Name", "Department", "Role", "Email", "Status"]}
            rows={employees.map((employee) => [
              employee.employee_code,
              employee.full_name,
              employee.department,
              employee.job_title,
              employee.work_email,
              <StatusBadge
                key={`${employee.employee_code}-status`}
                label={employee.status}
                tone={employee.status === "active" ? "success" : "warning"}
              />,
            ])}
          />
        </div>

        <EmployeeForm />
      </section>
    </div>
  );
}
