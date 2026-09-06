import "server-only";

import type { BudgetRange as PrismaBudgetRange } from "@prisma/client";

import type { BudgetRange } from "@/constants/budget-ranges";
import { prisma } from "@/lib/prisma";
import type { Lead, LeadCreateInput } from "@/types/lead";

/**
 * Erased at build time. Its only job is to fail `tsc` if the hand-written
 * budget values and the Prisma enum ever drift apart, rather than letting
 * Postgres reject the insert in production.
 */
const _budgetMatchesPrisma: PrismaBudgetRange = null as unknown as BudgetRange;
const _prismaMatchesBudget: BudgetRange = null as unknown as PrismaBudgetRange;
void _budgetMatchesPrisma;
void _prismaMatchesBudget;

/** The only module that touches Prisma. Swapping in a CRM is this file alone. */
export const leadRepository = {
  async create(input: LeadCreateInput): Promise<Lead> {
    const lead = await prisma.lead.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        budgetRange: input.budgetRange,
        source: input.source ?? null,
        ipHash: input.ipHash ?? null,
      },
    });

    return lead as Lead;
  },

  async listRecent(limit = 50): Promise<Lead[]> {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return leads as Lead[];
  },
};
