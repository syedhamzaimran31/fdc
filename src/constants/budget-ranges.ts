/**
 * `value` is stored and must match the Prisma `BudgetRange` enum; `label` is
 * safe to reword. Written out rather than imported from `@prisma/client`
 * because a client component uses this, and the Prisma runtime would cost the
 * browser ~100kB to read three strings. lead.repository.ts asserts at compile
 * time that the two lists still match.
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
