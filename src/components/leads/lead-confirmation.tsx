"use client";

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

  return (
    <div className="confirmation" role="status">
      <p className="confirmation-mark">Callback requested</p>

      <h3 className="confirmation-title">An advisor calls you within one business day.</h3>
      <p className="confirmation-body">
        You will get the floor plates, the current price list, and the payment schedule in writing
        on the same call. If nobody reaches you, we try once more and then stop.
      </p>

      <dl className="confirmation-receipt">
        <div className="receipt-row">
          <dt>Reference</dt>
          <dd>{reference.slice(-8).toUpperCase()}</dd>
        </div>
        <div className="receipt-row">
          <dt>Name</dt>
          <dd>{submitted.name}</dd>
        </div>
        <div className="receipt-row">
          <dt>Phone</dt>
          <dd>{submitted.phone}</dd>
        </div>
        <div className="receipt-row">
          <dt>Budget band</dt>
          <dd>{band?.short ?? submitted.budgetRange}</dd>
        </div>
      </dl>

      <button className="link-button" type="button" onClick={onStartOver}>
        Send another enquiry
      </button>
    </div>
  );
}
