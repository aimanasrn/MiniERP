export const databaseTableNames = [
  "profiles",
  "companies",
  "company_memberships",
  "company_invitations",
  "employees",
  "products",
  "customers",
  "invoices",
  "invoice_items",
  "expenses",
] as const;

export const rlsCapabilities = {
  platformAdminRoleSource: "jwt_app_metadata",
  companies: {
    platformSuperAdminCanInsert: true,
    platformSuperAdminCanReadWithoutMembership: true,
  },
  companyMemberships: {
    platformSuperAdminCanManageWithoutMembership: true,
    tenantAdminsCanAssignSuperAdminRole: false,
  },
  companyInvitations: {
    platformSuperAdminCanManageWithoutMembership: true,
    tenantAdminsCanInviteSuperAdminRole: false,
  },
} as const;

export const numericColumnStrategy = {
  source: "supabase_generated_types",
  monetaryColumnsUseString: true,
} as const;

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type MembershipRole =
  | "super_admin"
  | "company_admin"
  | "hr_manager"
  | "finance_manager"
  | "inventory_manager"
  | "sales_staff"
  | "employee";

export type MembershipStatus = "invited" | "active" | "suspended";

export type CompanyStatus = "draft" | "active" | "archived";

export type ProfileStatus = "pending" | "active" | "disabled";

export type EmployeeStatus = "active" | "inactive" | "terminated";

export type ProductStatus = "active" | "inactive" | "archived";

export type CustomerStatus = "active" | "inactive" | "archived";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "void";

export type ExpenseStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "paid";

type Tables = {
  profiles: {
    Row: {
      id: string;
      email: string;
      full_name: string | null;
      avatar_url: string | null;
      status: ProfileStatus;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id: string;
      email: string;
      full_name?: string | null;
      avatar_url?: string | null;
      status?: ProfileStatus;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      email?: string;
      full_name?: string | null;
      avatar_url?: string | null;
      status?: ProfileStatus;
      created_at?: string;
      updated_at?: string;
    };
  };
  companies: {
    Row: {
      id: string;
      name: string;
      slug: string;
      industry: string | null;
      country: string | null;
      currency_code: string | null;
      timezone: string | null;
      status: CompanyStatus;
      created_at: string;
      updated_at: string;
      created_by: string | null;
      updated_by: string | null;
    };
    Insert: {
      id?: string;
      name: string;
      slug: string;
      industry?: string | null;
      country?: string | null;
      currency_code?: string | null;
      timezone?: string | null;
      status?: CompanyStatus;
      created_at?: string;
      updated_at?: string;
      created_by?: string | null;
      updated_by?: string | null;
    };
    Update: {
      id?: string;
      name?: string;
      slug?: string;
      industry?: string | null;
      country?: string | null;
      currency_code?: string | null;
      timezone?: string | null;
      status?: CompanyStatus;
      created_at?: string;
      updated_at?: string;
      created_by?: string | null;
      updated_by?: string | null;
    };
  };
  company_memberships: {
    Row: {
      id: string;
      company_id: string;
      user_id: string;
      role: MembershipRole;
      status: MembershipStatus;
      joined_at: string | null;
      created_at: string;
      updated_at: string;
      created_by: string | null;
      updated_by: string | null;
    };
    Insert: {
      id?: string;
      company_id: string;
      user_id: string;
      role: MembershipRole;
      status?: MembershipStatus;
      joined_at?: string | null;
      created_at?: string;
      updated_at?: string;
      created_by?: string | null;
      updated_by?: string | null;
    };
    Update: {
      id?: string;
      company_id?: string;
      user_id?: string;
      role?: MembershipRole;
      status?: MembershipStatus;
      joined_at?: string | null;
      created_at?: string;
      updated_at?: string;
      created_by?: string | null;
      updated_by?: string | null;
    };
  };
  company_invitations: {
    Row: {
      id: string;
      company_id: string;
      email: string;
      role: MembershipRole;
      token: string;
      expires_at: string;
      accepted_at: string | null;
      invited_by: string | null;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      company_id: string;
      email: string;
      role: MembershipRole;
      token: string;
      expires_at: string;
      accepted_at?: string | null;
      invited_by?: string | null;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      company_id?: string;
      email?: string;
      role?: MembershipRole;
      token?: string;
      expires_at?: string;
      accepted_at?: string | null;
      invited_by?: string | null;
      created_at?: string;
      updated_at?: string;
    };
  };
  employees: {
    Row: {
      id: string;
      company_id: string;
      employee_code: string;
      full_name: string;
      work_email: string;
      phone: string | null;
      department: string | null;
      job_title: string | null;
      hire_date: string | null;
      status: EmployeeStatus;
      notes: string | null;
      created_at: string;
      updated_at: string;
      created_by: string | null;
      updated_by: string | null;
    };
    Insert: {
      id?: string;
      company_id: string;
      employee_code: string;
      full_name: string;
      work_email: string;
      phone?: string | null;
      department?: string | null;
      job_title?: string | null;
      hire_date?: string | null;
      status?: EmployeeStatus;
      notes?: string | null;
      created_at?: string;
      updated_at?: string;
      created_by?: string | null;
      updated_by?: string | null;
    };
    Update: {
      id?: string;
      company_id?: string;
      employee_code?: string;
      full_name?: string;
      work_email?: string;
      phone?: string | null;
      department?: string | null;
      job_title?: string | null;
      hire_date?: string | null;
      status?: EmployeeStatus;
      notes?: string | null;
      created_at?: string;
      updated_at?: string;
      created_by?: string | null;
      updated_by?: string | null;
    };
  };
  products: {
    Row: {
      id: string;
      company_id: string;
      sku: string;
      name: string;
      description: string | null;
      category: string | null;
      unit_price: string;
      stock_quantity: number;
      reorder_threshold: number;
      status: ProductStatus;
      created_at: string;
      updated_at: string;
      created_by: string | null;
      updated_by: string | null;
    };
    Insert: {
      id?: string;
      company_id: string;
      sku: string;
      name: string;
      description?: string | null;
      category?: string | null;
      unit_price?: string;
      stock_quantity?: number;
      reorder_threshold?: number;
      status?: ProductStatus;
      created_at?: string;
      updated_at?: string;
      created_by?: string | null;
      updated_by?: string | null;
    };
    Update: {
      id?: string;
      company_id?: string;
      sku?: string;
      name?: string;
      description?: string | null;
      category?: string | null;
      unit_price?: string;
      stock_quantity?: number;
      reorder_threshold?: number;
      status?: ProductStatus;
      created_at?: string;
      updated_at?: string;
      created_by?: string | null;
      updated_by?: string | null;
    };
  };
  customers: {
    Row: {
      id: string;
      company_id: string;
      name: string;
      contact_person: string | null;
      email: string | null;
      phone: string | null;
      billing_address: string | null;
      status: CustomerStatus;
      notes: string | null;
      created_at: string;
      updated_at: string;
      created_by: string | null;
      updated_by: string | null;
    };
    Insert: {
      id?: string;
      company_id: string;
      name: string;
      contact_person?: string | null;
      email?: string | null;
      phone?: string | null;
      billing_address?: string | null;
      status?: CustomerStatus;
      notes?: string | null;
      created_at?: string;
      updated_at?: string;
      created_by?: string | null;
      updated_by?: string | null;
    };
    Update: {
      id?: string;
      company_id?: string;
      name?: string;
      contact_person?: string | null;
      email?: string | null;
      phone?: string | null;
      billing_address?: string | null;
      status?: CustomerStatus;
      notes?: string | null;
      created_at?: string;
      updated_at?: string;
      created_by?: string | null;
      updated_by?: string | null;
    };
  };
  invoices: {
    Row: {
      id: string;
      company_id: string;
      invoice_number: string;
      customer_id: string;
      issue_date: string;
      due_date: string;
      status: InvoiceStatus;
      subtotal: string;
      tax_amount: string;
      total_amount: string;
      notes: string | null;
      created_at: string;
      updated_at: string;
      created_by: string | null;
      updated_by: string | null;
    };
    Insert: {
      id?: string;
      company_id: string;
      invoice_number: string;
      customer_id: string;
      issue_date: string;
      due_date: string;
      status?: InvoiceStatus;
      subtotal?: string;
      tax_amount?: string;
      total_amount?: string;
      notes?: string | null;
      created_at?: string;
      updated_at?: string;
      created_by?: string | null;
      updated_by?: string | null;
    };
    Update: {
      id?: string;
      company_id?: string;
      invoice_number?: string;
      customer_id?: string;
      issue_date?: string;
      due_date?: string;
      status?: InvoiceStatus;
      subtotal?: string;
      tax_amount?: string;
      total_amount?: string;
      notes?: string | null;
      created_at?: string;
      updated_at?: string;
      created_by?: string | null;
      updated_by?: string | null;
    };
  };
  invoice_items: {
    Row: {
      id: string;
      company_id: string;
      invoice_id: string;
      product_id: string | null;
      description: string;
      quantity: string;
      unit_price: string;
      line_total: string;
      created_at: string;
      updated_at: string;
      created_by: string | null;
      updated_by: string | null;
    };
    Insert: {
      id?: string;
      company_id: string;
      invoice_id: string;
      product_id?: string | null;
      description: string;
      quantity?: string;
      unit_price?: string;
      line_total?: string;
      created_at?: string;
      updated_at?: string;
      created_by?: string | null;
      updated_by?: string | null;
    };
    Update: {
      id?: string;
      company_id?: string;
      invoice_id?: string;
      product_id?: string | null;
      description?: string;
      quantity?: string;
      unit_price?: string;
      line_total?: string;
      created_at?: string;
      updated_at?: string;
      created_by?: string | null;
      updated_by?: string | null;
    };
  };
  expenses: {
    Row: {
      id: string;
      company_id: string;
      expense_date: string;
      category: string;
      vendor: string | null;
      description: string | null;
      amount: string;
      status: ExpenseStatus;
      notes: string | null;
      created_at: string;
      updated_at: string;
      created_by: string | null;
      updated_by: string | null;
    };
    Insert: {
      id?: string;
      company_id: string;
      expense_date: string;
      category: string;
      vendor?: string | null;
      description?: string | null;
      amount: string;
      status?: ExpenseStatus;
      notes?: string | null;
      created_at?: string;
      updated_at?: string;
      created_by?: string | null;
      updated_by?: string | null;
    };
    Update: {
      id?: string;
      company_id?: string;
      expense_date?: string;
      category?: string;
      vendor?: string | null;
      description?: string | null;
      amount?: string;
      status?: ExpenseStatus;
      notes?: string | null;
      created_at?: string;
      updated_at?: string;
      created_by?: string | null;
      updated_by?: string | null;
    };
  };
};

export type Database = {
  public: {
    Tables: Tables;
    Views: Record<string, never>;
    Functions: {
      can_access_company: {
        Args: {
          target_company_id: string;
        };
        Returns: boolean;
      };
      has_company_role: {
        Args: {
          target_company_id: string;
          allowed_roles: MembershipRole[];
        };
        Returns: boolean;
      };
      is_company_member: {
        Args: {
          target_company_id: string;
        };
        Returns: boolean;
      };
      is_platform_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_tenant_manageable_role: {
        Args: {
          target_role: MembershipRole;
        };
        Returns: boolean;
      };
    };
    Enums: {
      company_status: CompanyStatus;
      customer_status: CustomerStatus;
      employee_status: EmployeeStatus;
      expense_status: ExpenseStatus;
      invoice_status: InvoiceStatus;
      membership_role: MembershipRole;
      membership_status: MembershipStatus;
      product_status: ProductStatus;
      profile_status: ProfileStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
