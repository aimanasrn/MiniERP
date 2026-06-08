"use client";

import React, { useState } from "react";

import {
  validateCustomerInput,
  type CustomerValues,
} from "@/lib/validations/customers";
import type { CustomerStatus } from "@/types/database";

type CustomerFormProps = {
  initialValues?: Partial<CustomerValues>;
  onSubmit?: (values: CustomerValues) => Promise<void> | void;
  submitLabel?: string;
};

const defaultValues: CustomerValues = {
  name: "",
  contactPerson: "",
  email: "",
  phone: "",
  billingAddress: "",
  status: "active",
  notes: "",
};

const customerStatuses: CustomerStatus[] = ["active", "inactive", "archived"];

export function CustomerForm({
  initialValues,
  onSubmit,
  submitLabel = "Save customer",
}: CustomerFormProps) {
  const [values, setValues] = useState<CustomerValues>({
    ...defaultValues,
    ...initialValues,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const validated = validateCustomerInput(values);

    if (!validated.success) {
      setErrors(validated.errors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(validated.data);
        setMessage("Customer profile saved.");
      } else {
        setMessage("Customer profile is ready to be saved.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save customer.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateValue(field: keyof CustomerValues, value: string) {
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
        <p className="page-header__eyebrow">Relationship intake</p>
        <h3 className="m-0 text-2xl tracking-[-0.03em] text-[var(--text)]">
          Add the next customer account
        </h3>
        <p className="text-sm leading-6 text-[var(--text-muted)]">
          Standardize account ownership, contact routing, and billing details before invoicing starts.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          error={errors.name}
          label="Customer name"
          name="name"
          onChange={(value) => updateValue("name", value)}
          value={values.name}
        />
        <Field
          error={errors.contactPerson}
          label="Contact person"
          name="contactPerson"
          onChange={(value) => updateValue("contactPerson", value)}
          value={values.contactPerson}
        />
        <Field
          error={errors.email}
          label="Email"
          name="email"
          onChange={(value) => updateValue("email", value)}
          type="email"
          value={values.email}
        />
        <Field
          error={errors.phone}
          label="Phone"
          name="phone"
          onChange={(value) => updateValue("phone", value)}
          value={values.phone}
        />
        <SelectField
          label="Status"
          name="status"
          onChange={(value) => updateValue("status", value)}
          options={customerStatuses}
          value={values.status}
        />
        <div className="md:col-span-2">
          <TextAreaField
            error={errors.billingAddress}
            label="Billing address"
            name="billingAddress"
            onChange={(value) => updateValue("billingAddress", value)}
            value={values.billingAddress}
          />
        </div>
        <div className="md:col-span-2">
          <TextAreaField
            error={errors.notes}
            label="Notes"
            name="notes"
            onChange={(value) => updateValue("notes", value)}
            value={values.notes}
          />
        </div>
      </div>

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
