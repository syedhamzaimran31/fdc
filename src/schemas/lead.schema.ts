import { z } from "zod";

import { BUDGET_RANGE_VALUES } from "@/constants/budget-ranges";

/**
 * One schema, used by the form (via zodResolver) and by the API route.
 * The client gets instant feedback; the server never trusts it and revalidates,
 * because the endpoint is public and can be called without the form.
 */
export const leadInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(80, "That name looks too long."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Please enter your email address.")
    .email("Please enter a valid email address."),
  phone: z
    .string()
    .trim()
    // Deliberately permissive: buyers arrive with all sorts of formats and a
    // rejected real lead costs far more than a slightly messy one.
    .regex(/^\+?[0-9\s()-]{7,20}$/, "Please enter a valid phone number."),
  budgetRange: z.enum(BUDGET_RANGE_VALUES, {
    errorMap: () => ({ message: "Please choose a budget range." }),
  }),
  /**
   * Honeypot. Real people never see this field, so anything in it is a bot.
   * Cheap insurance for a public form that feeds a sales team.
   */
  company: z.string().optional(),
});

export type LeadInput = z.infer<typeof leadInputSchema>;
