"use client";

import React, { useState } from "react";

import {
  validateProductInput,
  type ProductValues,
} from "@/lib/validations/products";
import type { ProductStatus } from "@/types/database";

type ProductFormProps = {
  initialValues?: Partial<ProductValues>;
  onSubmit?: (values: ProductValues) => Promise<void> | void;
  submitLabel?: string;
};

const defaultValues: ProductValues = {
  sku: "",
  name: "",
  description: "",
  category: "",
  unitPrice: "",
  stockQuantity: "0",
  reorderThreshold: "0",
  status: "active",
};

const productStatuses: ProductStatus[] = ["active", "inactive", "archived"];

export function ProductForm({
  initialValues,
  onSubmit,
  submitLabel = "Save product",
}: ProductFormProps) {
  const [values, setValues] = useState<ProductValues>({
    ...defaultValues,
    ...initialValues,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const validated = validateProductInput(values);

    if (!validated.success) {
      setErrors(validated.errors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(validated.data);
        setMessage("Product record saved.");
      } else {
        setMessage("Product record is ready to be saved.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save product.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateValue(field: keyof ProductValues, value: string) {
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
        <p className="page-header__eyebrow">Catalog intake</p>
        <h3 className="m-0 text-2xl tracking-[-0.03em] text-[var(--text)]">
          Add the next stocked product
        </h3>
        <p className="text-sm leading-6 text-[var(--text-muted)]">
          Keep purchasing, warehouse, and sales aligned on the same inventory baseline.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          error={errors.sku}
          label="SKU"
          name="sku"
          onChange={(value) => updateValue("sku", value)}
          value={values.sku}
        />
        <Field
          error={errors.name}
          label="Product name"
          name="name"
          onChange={(value) => updateValue("name", value)}
          value={values.name}
        />
        <div className="md:col-span-2">
          <TextAreaField
            error={errors.description}
            label="Description"
            name="description"
            onChange={(value) => updateValue("description", value)}
            value={values.description}
          />
        </div>
        <Field
          error={errors.category}
          label="Category"
          name="category"
          onChange={(value) => updateValue("category", value)}
          value={values.category}
        />
        <Field
          error={errors.unitPrice}
          label="Unit price"
          name="unitPrice"
          onChange={(value) => updateValue("unitPrice", value)}
          value={values.unitPrice}
        />
        <Field
          error={errors.stockQuantity}
          label="Stock quantity"
          name="stockQuantity"
          onChange={(value) => updateValue("stockQuantity", value)}
          value={values.stockQuantity}
        />
        <Field
          error={errors.reorderThreshold}
          label="Reorder threshold"
          name="reorderThreshold"
          onChange={(value) => updateValue("reorderThreshold", value)}
          value={values.reorderThreshold}
        />
        <SelectField
          label="Status"
          name="status"
          onChange={(value) => updateValue("status", value)}
          options={productStatuses}
          value={values.status}
        />
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
  value: string;
};

function Field({ error, label, name, onChange, value }: FieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-[var(--text)]">{label}</span>
      <input
        className="w-full rounded-2xl border border-[var(--line)] bg-[rgba(248,251,255,0.03)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--line-strong)]"
        name={name}
        onChange={(event) => onChange(event.target.value)}
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
