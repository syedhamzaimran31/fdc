import { z } from "zod";

import { BUDGET_RANGE_VALUES } from "@/constants/budget-ranges";

/**
 * Used by both the form and the API route. The server revalidates rather than
 * trusting the client, because the endpoint is public and callable without it.
 *
 * Messages are short by design: they render on the label's line, and a wrapped
 * message changes the field's height.
 */
export const leadInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(80, "Name is too long"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Required")
    .email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    // Deliberately permissive: buyers arrive with all sorts of formats and a
    // rejected real lead costs far more than a slightly messy one.
    .regex(/^\+?[0-9\s()-]{7,20}$/, "Enter a valid number"),
  budgetRange: z.enum(BUDGET_RANGE_VALUES, {
    errorMap: () => ({ message: "Choose a band" }),
  }),
  /** Honeypot: hidden from people, so anything in it is a bot. */
  company: z.string().optional(),
});

export type LeadInput = z.infer<typeof leadInputSchema>;
