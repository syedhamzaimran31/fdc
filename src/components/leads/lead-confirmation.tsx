"use client";

import { Button } from "@/components/ui/button";
import { BUDGET_RANGES } from "@/constants/budget-ranges";
import type { LeadInput } from "@/schemas/lead.schema";

interface LeadConfirmationProps {
  reference: string;
  submitted: LeadInput;
  onStartOver: () => void;
}

/**
 * Success state, written as a receipt rather than a thank-you card.
 *
 * A buyer who has just handed over a phone number wants proof of what was sent
 * and what happens next — a green tick answers neither. The reference is short
 * enough to read out on the call.
 */
export function LeadConfirmation({ reference, submitted, onStartOver }: LeadConfirmationProps) {
  const band = BUDGET_RANGES.find((range) => range.value === submitted.budgetRange);

  const rows = [
    { label: "Reference", value: reference.slice(-8).toUpperCase() },
    { label: "Name", value: submitted.name },
    { label: "Phone", value: submitted.phone },
    { label: "Budget band", value: band?.short ?? submitted.budgetRange },
  ];

  return (
    <div className="pt-6" role="status">
      <p className="text-success font-data text-xs tracking-[0.14em] uppercase">
        Callback requested
      </p>

      <h3 className="font-display mt-4 text-[1.6rem] leading-tight font-bold tracking-[-0.02em]">
        An advisor calls you within one business day.
      </h3>
      <p className="text-muted-foreground mt-3 text-pretty">
        You will get the floor plates, the current price list, and the payment schedule in writing
        on the same call. If nobody reaches you, we try once more and then stop.
      </p>

      <dl className="border-border mt-6 border-t">
        {rows.map((row) => (
          <div
            className="border-border font-data flex justify-between gap-4 border-b py-3 text-[0.8125rem]"
            key={row.label}
          >
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="text-right">{row.value}</dd>
          </div>
        ))}
      </dl>

      <Button variant="link" size="inline" type="button" onClick={onStartOver}>
        Send another enquiry
      </Button>
    </div>
  );
}
