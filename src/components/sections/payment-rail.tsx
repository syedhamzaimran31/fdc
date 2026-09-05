import { PAYMENT_PLAN } from "@/constants/project";

/**
 * The page's signature element.
 *
 * An off-plan apartment is bought on a schedule, not a price, so the schedule
 * is drawn to scale: each band's width is its share of the total. The numbers
 * carry the information; the bar makes the shape of the commitment readable at
 * a glance. It draws once on load, and not at all under reduced motion.
 */
export function PaymentRail() {
  const total = PAYMENT_PLAN.reduce((sum, stage) => sum + stage.share, 0);

  return (
    <section aria-labelledby="payment-plan-heading">
      <div className="rail-head">
        <h2 className="tag" id="payment-plan-heading">
          Payment plan
        </h2>
        <p className="rail-total">
          {PAYMENT_PLAN.map((stage) => stage.share).join(" / ")} · interest free
        </p>
      </div>

      {/* Decorative: every value below is stated in text in the list. */}
      <div className="rail-track" aria-hidden="true">
        {PAYMENT_PLAN.map((stage, index) => (
          <span
            key={stage.step}
            className="rail-fill"
            style={{
              width: `${(stage.share / total) * 100}%`,
              animationDelay: `${index * 120}ms`,
            }}
          />
        ))}
      </div>

      <ol className="rail-steps">
        {PAYMENT_PLAN.map((stage) => (
          <li className="rail-step" key={stage.step}>
            <p className="rail-share">{stage.share}%</p>
            <p className="rail-label">{stage.label}</p>
            <p className="rail-timing">{stage.timing}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
