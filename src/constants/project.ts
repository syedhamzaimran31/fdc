// Every figure here is illustrative. A real build takes them from the
// developer's price list; this is the only file that needs to change.

export const PROJECT = {
  name: "Skyline Residences",
  developer: "Meridian Developments",
  district: "Dubai",
  reference: "SKY-2027",
  handover: { label: "Handover", value: "Q4 2027" },
} as const;

// `share` values must total 100.
export const PAYMENT_PLAN = [
  { step: 1, share: 20, label: "On booking", timing: "At reservation" },
  { step: 2, share: 40, label: "During construction", timing: "2026 – 2027, by milestone" },
  { step: 3, share: 40, label: "On handover", timing: "Q4 2027" },
] as const;

export const PROJECT_FACTS = [
  { label: "Unit mix", value: "1 & 2 bed", note: "742 – 1,180 sq ft" },
  { label: "Starting price", value: "AED 940,000", note: "1 bed, tower-side" },
  { label: "Payment plan", value: "20 / 40 / 40", note: "Interest free" },
  { label: "Handover", value: "Q4 2027", note: "Escrow registered" },
] as const;

/**
 * Objection handling, written as the answers a buyer actually asks for on a
 * first call. Kept short — this page exists to earn the call, not replace it.
 */
export const ASSURANCES = [
  {
    label: "Escrow registered",
    body: "Every payment goes to a RERA-supervised escrow account tied to construction milestones, not to the developer directly.",
  },
  {
    label: "No agency fee",
    body: "Off-plan units are bought at the developer price list. Our commission is paid by the developer, not by you.",
  },
  {
    label: "One call, not a campaign",
    body: "An advisor calls once with the floor plates and the current price list. You tell us if you want a second call.",
  },
] as const;
