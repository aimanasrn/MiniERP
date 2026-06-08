import type { CustomerStatus } from "@/types/database";

export type CustomerInput = {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  billingAddress: string;
  status: CustomerStatus;
  notes: string;
};

export type CustomerValues = CustomerInput;

export type CustomerValidationResult =
  | {
      success: true;
      data: CustomerValues;
    }
  | {
      success: false;
      errors: Record<string, string>;
    };

function normalizeValue(value: string) {
  return value.trim();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateCustomerInput(input: CustomerInput): CustomerValidationResult {
  const data: CustomerValues = {
    name: normalizeValue(input.name),
    contactPerson: normalizeValue(input.contactPerson),
    email: normalizeValue(input.email).toLowerCase(),
    phone: normalizeValue(input.phone),
    billingAddress: normalizeValue(input.billingAddress),
    status: input.status,
    notes: normalizeValue(input.notes),
  };
  const errors: Record<string, string> = {};

  if (!data.name) {
    errors.name = "Enter the customer name.";
  }

  if (!data.contactPerson) {
    errors.contactPerson = "Enter the primary contact.";
  }

  if (!isValidEmail(data.email)) {
    errors.email = "Enter a valid customer email.";
  }

  if (!data.billingAddress) {
    errors.billingAddress = "Enter the billing address.";
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
