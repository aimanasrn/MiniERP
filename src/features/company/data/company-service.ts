import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  validateCompanySetupInput,
  type CompanySetupInput,
  type CompanySetupValues,
} from "@/lib/validations/company";
import type { Database } from "@/types/database";

type CompanyRow = Database["public"]["Tables"]["companies"]["Row"];
type CompanyUpdate = Database["public"]["Tables"]["companies"]["Update"];

function toCompanySetupValues(
  row: Pick<
    CompanyRow,
    "name" | "industry" | "country" | "currency_code" | "timezone"
  >,
): CompanySetupValues {
  return {
    name: row.name ?? "",
    industry: row.industry ?? "",
    country: row.country ?? "",
    currencyCode: row.currency_code ?? "",
    timezone: row.timezone ?? "",
  };
}

export function toCompanySetupUpdate(values: CompanySetupValues) {
  return {
    name: values.name,
    industry: values.industry,
    country: values.country,
    currency_code: values.currencyCode,
    timezone: values.timezone,
  };
}

export async function getCompanySetup(companyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("companies")
    .select("name, industry, country, currency_code, timezone")
    .eq("id", companyId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return toCompanySetupValues(data);
}

export async function saveCompanySetup(
  companyId: string,
  input: CompanySetupInput,
) {
  const validated = validateCompanySetupInput(input);

  if (!validated.success) {
    throw new Error("Company setup validation failed.");
  }

  const supabase = await createSupabaseServerClient();
  const companyUpdate = toCompanySetupUpdate(validated.data) as CompanyUpdate;
  const companiesTable = supabase.from("companies") as unknown as {
    update: (
      values: CompanyUpdate,
    ) => {
      eq: (
        column: "id",
        value: string,
      ) => {
        select: (
          columns: "name, industry, country, currency_code, timezone",
        ) => {
          single: () => Promise<{
            data: Pick<
              CompanyRow,
              "name" | "industry" | "country" | "currency_code" | "timezone"
            > | null;
            error: Error | null;
          }>;
        };
      };
    };
  };
  const { data, error } = await companiesTable
    .update(companyUpdate)
    .eq("id", companyId)
    .select("name, industry, country, currency_code, timezone")
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Company setup could not be saved.");
  }

  return toCompanySetupValues(data);
}
