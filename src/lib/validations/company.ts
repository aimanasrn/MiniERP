export type CompanySetupInput = {
  name: string;
  industry: string;
  country: string;
  currencyCode: string;
  timezone: string;
};

export type CompanySetupValues = {
  name: string;
  industry: string;
  country: string;
  currencyCode: string;
  timezone: string;
};

export type CompanyValidationResult =
  | {
      success: true;
      data: CompanySetupValues;
    }
  | {
      success: false;
      errors: Record<string, string>;
    };

function normalizeValue(value: string) {
  return value.trim();
}

export function validateCompanySetupInput(
  input: CompanySetupInput,
): CompanyValidationResult {
  const data: CompanySetupValues = {
    name: normalizeValue(input.name),
    industry: normalizeValue(input.industry),
    country: normalizeValue(input.country),
    currencyCode: normalizeValue(input.currencyCode).toUpperCase(),
    timezone: normalizeValue(input.timezone),
  };
  const errors: Record<string, string> = {};

  if (!data.name) {
    errors.name = "Enter the company name.";
  }

  if (!data.industry) {
    errors.industry = "Enter the primary industry.";
  }

  if (!data.country) {
    errors.country = "Enter the operating country.";
  }

  if (data.currencyCode.length !== 3) {
    errors.currencyCode = "Use a 3-letter currency code.";
  }

  if (!data.timezone) {
    errors.timezone = "Enter the primary timezone.";
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
