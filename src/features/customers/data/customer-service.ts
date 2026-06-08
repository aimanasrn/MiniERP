import type { Database } from "@/types/database";
import type { CustomerValues } from "@/lib/validations/customers";

type CustomerInsert = Database["public"]["Tables"]["customers"]["Insert"];
type CustomerMetricRecord = Pick<
  Database["public"]["Tables"]["customers"]["Row"],
  "status"
>;

function normalizeValue(value: string) {
  return value.trim();
}

export function buildCustomerPayload(input: CustomerValues): Omit<CustomerInsert, "company_id"> {
  return {
    name: normalizeValue(input.name),
    contact_person: normalizeValue(input.contactPerson),
    email: normalizeValue(input.email).toLowerCase(),
    phone: normalizeValue(input.phone) || null,
    billing_address: normalizeValue(input.billingAddress),
    status: input.status,
    notes: normalizeValue(input.notes) || null,
  };
}

export function getCustomerMetrics(records: readonly CustomerMetricRecord[]) {
  return records.reduce(
    (summary, record) => {
      summary.total += 1;
      summary[record.status] += 1;

      return summary;
    },
    {
      total: 0,
      active: 0,
      inactive: 0,
      archived: 0,
    },
  );
}
