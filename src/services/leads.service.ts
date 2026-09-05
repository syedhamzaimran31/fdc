import { API_ROUTES } from "@/constants/api";
import { postJson } from "@/lib/api-client";
import type { LeadInput } from "@/schemas/lead.schema";
import type { SubmitLeadResult } from "@/types/api";

/**
 * The only module that knows the lead endpoint exists. Components and hooks
 * talk to this; nothing else constructs a URL or touches axios directly.
 */
export const leadsService = {
  submit(input: LeadInput): Promise<SubmitLeadResult> {
    return postJson<SubmitLeadResult, LeadInput>(API_ROUTES.LEAD, input);
  },
};
