"use client";

import React, { useState } from "react";

import type { InvoiceStatus } from "@/types/database";
import {
  validateInvoiceInput,
  type InvoiceLineItemInput,
  type InvoiceValues,
} from "@/lib/validations/invoices";

type InvoiceFormProps = {
  initialValues?: Partial<InvoiceValues>;
  onSubmit?: (values: InvoiceValues) => Promise<void> | void;
  submitLabel?: string;
};

const defaultItem: InvoiceLineItemInput = {
  description: "",
  quantity: "1",
  unitPrice: "0.00",
};

const defaultValues: InvoiceValues = {
  invoiceNumber: "",
  customerId: "",
  issueDate: "",
  dueDate: "",
  status: "draft",
  taxAmount: "0.00",
  notes: "",
  items: [defaultItem],
};

const invoiceStatuses: InvoiceStatus[] = ["draft", "sent", "paid", "overdue", "void"];

export function InvoiceForm({
  initialValues,
  onSubmit,
  submitLabel = "Save invoice",
}: InvoiceFormProps) {
  const [values, setValues] = useState<InvoiceValues>({
    ...defaultValues,
    ...initialValues,
    items: initialValues?.items ?? defaultValues.items,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const validated = validateInvoiceInput(values);

    if (!validated.success) {
      setErrors(validated.errors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(validated.data);
        setMessage("Invoice has been prepared for submission.");
      } else {
        setMessage("Invoice draft is ready for finance review.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save invoice.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateValue(field: keyof InvoiceValues, value: string) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateItem(index: number, field: keyof InvoiceLineItemInput, value: string) {
    setValues((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    }));
  }

  return (
    <form
      className="space-y-6 rounded-[22px] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(17,33,59,0.94),rgba(10,22,40,0.96))] p-6 shadow-[var(--shadow-md)]"
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <p className="page-header__eyebrow">Revenue intake</p>
        <h3 className="m-0 text-2xl tracking-[-0.03em] text-[var(--text)]">
          Stage the next customer invoice
        </h3>
        <p className="text-sm leading-6 text-[var(--text-muted)]">
          Capture billing terms, line items, and tax treatment before the invoice enters the send queue.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          error={errors.invoiceNumber}
          label="Invoice number"
          name="invoiceNumber"
          onChange={(value) => updateValue("invoiceNumber", value)}
          value={values.invoiceNumber}
        />
        <Field
          error={errors.customerId}
          label="Customer ID"
          name="customerId"
          onChange={(value) => updateValue("customerId", value)}
          value={values.customerId}
        />
        <Field
          error={errors.issueDate}
          label="Issue date"
          name="issueDate"
          onChange={(value) => updateValue("issueDate", value)}
          type="date"
          value={values.issueDate}
        />
        <Field
          error={errors.dueDate}
          label="Due date"
          name="dueDate"
          onChange={(value) => updateValue("dueDate", value)}
          type="date"
          value={values.dueDate}
        />
        <SelectField
          label="Status"
          name="status"
          onChange={(value) => updateValue("status", value)}
          options={invoiceStatuses}
          value={values.status}
        />
        <Field
          error={errors.taxAmount}
          label="Tax amount"
          name="taxAmount"
          onChange={(value) => updateValue("taxAmount", value)}
          value={values.taxAmount}
        />
      </div>

      <div className="space-y-4 rounded-2xl border border-[var(--line)] bg-[rgba(248,251,255,0.03)] p-4">
        <div>
          <p className="m-0 text-sm font-medium text-[var(--text)]">Invoice line</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            The MVP keeps one editable line item in view for fast finance-side intake.
          </p>
        </div>

        {values.items.map((item, index) => (
          <div key={`invoice-item-${index}`} className="grid gap-4 md:grid-cols-3">
            <Field
              error={errors[`items.${index}.description`]}
              label="Line item description"
              name={`items.${index}.description`}
              onChange={(value) => updateItem(index, "description", value)}
              value={item.description}
            />
            <Field
              error={errors[`items.${index}.quantity`]}
              label="Quantity"
              name={`items.${index}.quantity`}
              onChange={(value) => updateItem(index, "quantity", value)}
              value={item.quantity}
            />
            <Field
              error={errors[`items.${index}.unitPrice`]}
              label="Unit price"
              name={`items.${index}.unitPrice`}
              onChange={(value) => updateItem(index, "unitPrice", value)}
              value={item.unitPrice}
            />
          </div>
        ))}
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
