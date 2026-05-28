"use client";

import React, { useState } from "react";

import {
  validateCompanySetupInput,
  type CompanySetupValues,
} from "@/lib/validations/company";

type CompanySetupFormProps = {
  initialValues?: Partial<CompanySetupValues>;
  onSubmit?: (values: CompanySetupValues) => Promise<void> | void;
  submitLabel?: string;
};

const defaultValues: CompanySetupValues = {
  name: "",
  industry: "",
  country: "",
  currencyCode: "",
  timezone: "",
};

export function CompanySetupForm({
  initialValues,
  onSubmit,
  submitLabel = "Save company setup",
}: CompanySetupFormProps) {
  const [values, setValues] = useState<CompanySetupValues>({
    ...defaultValues,
    ...initialValues,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const validated = validateCompanySetupInput(values);

    if (!validated.success) {
      setErrors(validated.errors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(validated.data);
        setMessage("Company details saved.");
      } else {
        setMessage("Company details are ready to be saved.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save setup.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateValue(field: keyof CompanySetupValues, value: string) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <form
      className="space-y-6 rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur"
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
          Company setup
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          Finalize the company profile
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          Confirm the core business details so the team starts from a clean,
          shared company record.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          error={errors.name}
          label="Company name"
          name="name"
          onChange={(value) => updateValue("name", value)}
          value={values.name}
        />
        <Field
          error={errors.industry}
          label="Industry"
          name="industry"
          onChange={(value) => updateValue("industry", value)}
          value={values.industry}
        />
        <Field
          error={errors.country}
          label="Country"
          name="country"
          onChange={(value) => updateValue("country", value)}
          value={values.country}
        />
        <Field
          error={errors.currencyCode}
          label="Currency"
          name="currencyCode"
          onChange={(value) => updateValue("currencyCode", value)}
          value={values.currencyCode}
        />
        <div className="md:col-span-2">
          <Field
            error={errors.timezone}
            label="Timezone"
            name="timezone"
            onChange={(value) => updateValue("timezone", value)}
            value={values.timezone}
          />
        </div>
      </div>

      {message ? (
        <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
          {message}
        </p>
      ) : null}

      <button
        className="inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300"
        disabled={isSubmitting}
        type="submit"
      >
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
      <span className="text-sm font-medium text-slate-800">{label}</span>
      <input
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white"
        name={name}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
      {error ? <span className="text-sm text-rose-600">{error}</span> : null}
    </label>
  );
}
