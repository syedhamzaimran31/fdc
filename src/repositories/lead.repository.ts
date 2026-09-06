import "server-only";

import type { BudgetRange as PrismaBudgetRange } from "@prisma/client";

import type { BudgetRange } from "@/constants/budget-ranges";
import { demoStore } from "@/lib/demo-store";
import { isDatabaseConfigured } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
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

/**
 * The only module that touches Prisma. Swapping in a CRM is this file alone.
 *
 * Without DATABASE_URL it falls through to the demo store so the endpoint still
 * answers — see lib/demo-store.ts for why that is a development affordance and
 * not a second way to run this in production.
 */
export const leadRepository = {
  async create(input: LeadCreateInput): Promise<Lead> {
    if (!isDatabaseConfigured) return demoStore.create(input);

    const lead = await getPrisma().lead.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        budgetRange: input.budgetRange,
        source: input.source ?? null,
        ipHash: input.ipHash ?? null,
        status: input.status ?? "NEW",
      },
    });

    return lead as Lead;
  },

  async listRecent(limit = 50): Promise<Lead[]> {
    if (!isDatabaseConfigured) return demoStore.listRecent(limit);

    const leads = await getPrisma().lead.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return leads as Lead[];
  },
};
