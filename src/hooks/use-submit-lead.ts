"use client";

import { useMutation } from "@tanstack/react-query";

import type { ApiError } from "@/lib/api-client";
import { leadsService } from "@/services/leads.service";
import type { LeadInput } from "@/schemas/lead.schema";
import type { SubmitLeadResult } from "@/types/api";

/** Components consume this hook; they never call axios or the service directly. */
export function useSubmitLead() {
  return useMutation<SubmitLeadResult, ApiError, LeadInput>({
    mutationFn: (input) => leadsService.submit(input),
    // A lead submission is not idempotent. Retrying a request that may have
    // already succeeded would create duplicate leads for the sales team.
    retry: false,
  });
}
