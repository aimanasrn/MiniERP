"use client";

import React, { useState } from "react";

import type { ExpenseStatus } from "@/types/database";
import {
  validateExpenseInput,
  type ExpenseValues,
} from "@/lib/validations/expenses";

type ExpenseFormProps = {
  initialValues?: Partial<ExpenseValues>;
  onSubmit?: (values: ExpenseValues) => Promise<void> | void;
  submitLabel?: string;
};

const defaultValues: ExpenseValues = {
  expenseDate: "",
  category: "",
  vendor: "",
  description: "",
  amount: "0.00",
  status: "draft",
  notes: "",
};

const expenseStatuses: ExpenseStatus[] = [
  "draft",
  "submitted",
  "approved",
  "rejected",
  "paid",
];

export function ExpenseForm({
  initialValues,
  onSubmit,
  submitLabel = "Save expense",
}: ExpenseFormProps) {
  const [values, setValues] = useState<ExpenseValues>({
    ...defaultValues,
    ...initialValues,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const validated = validateExpenseInput(values);

    if (!validated.success) {
      setErrors(validated.errors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(validated.data);
        setMessage("Expense has been routed to finance review.");
      } else {
        setMessage("Expense is ready for the approval queue.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save expense.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateValue(field: keyof ExpenseValues, value: string) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <form
      className="space-y-6 rounded-[22px] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(17,33,59,0.94),rgba(10,22,40,0.96))] p-6 shadow-[var(--shadow-md)]"
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <p className="page-header__eyebrow">Spend intake</p>
        <h3 className="m-0 text-2xl tracking-[-0.03em] text-[var(--text)]">
          Log a finance-bound expense
        </h3>
        <p className="text-sm leading-6 text-[var(--text-muted)]">
          Standardize category, vendor, and approval status before the expense enters reimbursement or payment workflows.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          error={errors.expenseDate}
          label="Expense date"
          name="expenseDate"
          onChange={(value) => updateValue("expenseDate", value)}
          type="date"
          value={values.expenseDate}
        />
        <SelectField
          label="Status"
          name="status"
          onChange={(value) => updateValue("status", value)}
          options={expenseStatuses}
          value={values.status}
        />
        <Field
          error={errors.category}
          label="Category"
          name="category"
          onChange={(value) => updateValue("category", value)}
          value={values.category}
        />
        <Field
          error={errors.vendor}
          label="Vendor"
          name="vendor"
          onChange={(value) => updateValue("vendor", value)}
          value={values.vendor}
        />
        <Field
          error={errors.amount}
          label="Amount"
          name="amount"
          onChange={(value) => updateValue("amount", value)}
          value={values.amount}
        />
        <Field
          error={errors.description}
          label="Description"
          name="description"
          onChange={(value) => updateValue("description", value)}
          value={values.description}
        />
      </div>

      <TextAreaField
        error={errors.notes}
        label="Notes"
        name="notes"
        onChange={(value) => updateValue("notes", value)}
        value={values.notes}
      />

      {message ? (
        <p className="rounded-2xl border border-[var(--line)] bg-[rgba(248,251,255,0.03)] px-4 py-3 text-sm text-[var(--text-muted)]">
          {message}
        </p>
      ) : null}

      <button className="button-primary" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

type FieldProps = {
  error?: string;
  label: string;
  name: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
};

function Field({ error, label, name, onChange, type = "text", value }: FieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-[var(--text)]">{label}</span>
      <input
        className="w-full rounded-2xl border border-[var(--line)] bg-[rgba(248,251,255,0.03)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--line-strong)]"
        name={name}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
      />
      {error ? <span className="text-sm text-[var(--danger)]">{error}</span> : null}
    </label>
  );
}

type SelectFieldProps = {
  label: string;
  name: string;
  onChange: (value: string) => void;
  options: readonly string[];
  value: string;
};

function SelectField({ label, name, onChange, options, value }: SelectFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-[var(--text)]">{label}</span>
      <select
        className="w-full rounded-2xl border border-[var(--line)] bg-[rgba(248,251,255,0.03)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--line-strong)]"
        name={name}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

type TextAreaFieldProps = {
  error?: string;
  label: string;
  name: string;
  onChange: (value: string) => void;
  value: string;
};

function TextAreaField({
  error,
  label,
  name,
  onChange,
  value,
}: TextAreaFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-[var(--text)]">{label}</span>
      <textarea
        className="min-h-28 w-full rounded-2xl border border-[var(--line)] bg-[rgba(248,251,255,0.03)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--line-strong)]"
        name={name}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
      {error ? <span className="text-sm text-[var(--danger)]">{error}</span> : null}
    </label>
  );
}
