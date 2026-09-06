import { PAYMENT_PLAN } from "@/constants/project";

/**
 * The page's signature element.
 *
 * An off-plan apartment is bought on a schedule, not a price, so the schedule
 * is drawn to scale: each band's width is its share of the total. The numbers
 * carry the information; the bar makes the shape of the commitment readable at
 * a glance.
 */
export function PaymentRail() {
  const total = PAYMENT_PLAN.reduce((sum, stage) => sum + stage.share, 0);

  return (
    <section aria-labelledby="payment-plan-heading">
      <div className="border-border-strong flex flex-wrap items-baseline justify-between gap-2 border-b pb-3">
        <h2 className="tag" id="payment-plan-heading">
          Payment plan
        </h2>
        <p className="font-data text-[0.8125rem]">
          {PAYMENT_PLAN.map((stage) => stage.share).join(" / ")} · interest free
        </p>
      </div>

      {/* Decorative: every value below is stated in text in the list. */}
      <div className="bg-surface border-border-strong mt-5 flex h-3.5 border" aria-hidden="true">
        {PAYMENT_PLAN.map((stage, index) => (
          <span
            key={stage.step}
            className="rail-fill bg-primary border-background h-full border-r last:border-r-0"
            style={{
              width: `${(stage.share / total) * 100}%`,
              animationDelay: `${index * 120}ms`,
            }}
          />
        ))}
      </div>

      {/* Cells are padded on both sides, not just the right: the dividers are
          the right border of the previous cell, so without a left inset the
          next cell's figures sit hard against the rule. */}
      <ol className="border-border mt-5 grid list-none grid-cols-1 border-t sm:grid-cols-3">
        {PAYMENT_PLAN.map((stage) => (
          <li
            className="border-border border-b py-4 last:border-b-0 sm:border-r sm:border-b-0
              sm:px-6 sm:first:pl-0 sm:last:border-r-0 sm:last:pr-0"
            key={stage.step}
          >
            <p className="font-display text-[2.125rem] leading-none font-bold tracking-[-0.02em]">
              {stage.share}%
            </p>
            <p className="mt-2 text-base font-semibold">{stage.label}</p>
            <p className="text-muted-foreground font-data mt-1 text-xs">{stage.timing}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
