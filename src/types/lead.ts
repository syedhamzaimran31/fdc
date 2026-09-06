import type { BudgetRange } from "@/constants/budget-ranges";

/** Lead statuses owned by the sales team. Mirrors the Prisma LeadStatus enum. */
export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "UNQUALIFIED";

/** The validated fields a lead is created from. */
export interface LeadCreateInput {
  name: string;
  email: string;
  phone: string;
  budgetRange: BudgetRange;
  source?: string;
  ipHash?: string;
  /** Defaults to NEW. Set to UNQUALIFIED for suspected spam. */
  status?: LeadStatus;
}

/** A lead as it comes back from the database. */
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  budgetRange: BudgetRange;
  status: LeadStatus;
  source: string | null;
  ipHash: string | null;
  createdAt: Date;
  updatedAt: Date;
}
