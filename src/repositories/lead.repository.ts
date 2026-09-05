import "server-only";

import type { BudgetRange as PrismaBudgetRange } from "@prisma/client";

import type { BudgetRange } from "@/constants/budget-ranges";
import { prisma } from "@/lib/prisma";
import type { Lead, LeadCreateInput } from "@/types/lead";

/**
 * Compile-time guard that the hand-written budget values in
 * `src/constants/budget-ranges.ts` are exactly the Prisma enum members.
 *
 * These two assignments are erased at build time and cost nothing at runtime,
 * but if anyone adds a band to one list and forgets the other, `tsc` fails
 * here instead of Postgres rejecting the insert in production.
 */
const _budgetMatchesPrisma: PrismaBudgetRange = null as unknown as BudgetRange;
const _prismaMatchesBudget: BudgetRange = null as unknown as PrismaBudgetRange;
void _budgetMatchesPrisma;
void _prismaMatchesBudget;

/**
 * The only module that talks to the database about leads.
 *
 * Everything above it — the route, the service, the form — deals in plain
 * types and has no idea Prisma exists. Moving the brokerage onto a CRM means
 * rewriting this file and nothing else.
 */
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

  /** Used by the sales tooling, not the landing page. */
  async listRecent(limit = 50): Promise<Lead[]> {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return leads as Lead[];
  },
};
