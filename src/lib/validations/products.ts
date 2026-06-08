import type { ProductStatus } from "@/types/database";

export type ProductInput = {
  sku: string;
  name: string;
  description: string;
  category: string;
  unitPrice: string;
  stockQuantity: string;
  reorderThreshold: string;
  status: ProductStatus;
};

export type ProductValues = ProductInput;

export type ProductValidationResult =
  | {
      success: true;
      data: ProductValues;
    }
  | {
      success: false;
      errors: Record<string, string>;
    };

function normalizeValue(value: string) {
  return value.trim();
}

function isNonNegativeInteger(value: string) {
  return /^\d+$/.test(value);
}

function isMoneyValue(value: string) {
  return /^\d+(\.\d{1,2})?$/.test(value);
}

export function validateProductInput(input: ProductInput): ProductValidationResult {
  const data: ProductValues = {
    sku: normalizeValue(input.sku).toUpperCase(),
    name: normalizeValue(input.name),
    description: normalizeValue(input.description),
    category: normalizeValue(input.category),
    unitPrice: normalizeValue(input.unitPrice),
    stockQuantity: normalizeValue(input.stockQuantity),
    reorderThreshold: normalizeValue(input.reorderThreshold),
    status: input.status,
  };
  const errors: Record<string, string> = {};

  if (!data.sku) {
    errors.sku = "Enter a SKU.";
  }

  if (!data.name) {
    errors.name = "Enter the product name.";
  }

  if (!data.category) {
    errors.category = "Enter a product category.";
  }

  if (!isMoneyValue(data.unitPrice)) {
    errors.unitPrice = "Enter a valid unit price.";
  }

  if (!isNonNegativeInteger(data.stockQuantity)) {
    errors.stockQuantity = "Enter a valid stock quantity.";
  }

  if (!isNonNegativeInteger(data.reorderThreshold)) {
    errors.reorderThreshold = "Enter a valid reorder threshold.";
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
