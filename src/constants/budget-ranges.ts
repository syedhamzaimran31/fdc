/**
 * Budget bands the brokerage sells against.
 *
 * `value` matches the Prisma `BudgetRange` enum exactly and is what gets stored,
 * so it must stay stable. `label` is what the buyer reads and is safe to reword.
 * `short` is used in dense contexts where the full label would wrap.
 *
 * The values are written out here rather than imported from `@prisma/client`
 * on purpose: this module is used by a client component, and pulling the Prisma
 * runtime into the browser bundle to read three strings would be a needless
 * ~100kB. `src/repositories/lead.repository.ts` holds a compile-time assertion
 * so the two lists cannot drift apart.
 */
export const BUDGET_RANGES = [
  { value: "AED_900K_1_2M", label: "AED 900,000 – 1.2M", short: "900k–1.2M" },
  { value: "AED_1_2M_1_5M", label: "AED 1.2M – 1.5M", short: "1.2–1.5M" },
  { value: "AED_1_5M_PLUS", label: "AED 1.5M and above", short: "1.5M+" },
] as const;

export type BudgetRange = (typeof BUDGET_RANGES)[number]["value"];

export const BUDGET_RANGE_VALUES = BUDGET_RANGES.map((range) => range.value) as [
  BudgetRange,
  ...BudgetRange[],
];
