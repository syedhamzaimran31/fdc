import { ASSURANCES } from "@/constants/project";

/**
 * The three objections that stop a Dubai off-plan enquiry, answered before the
 * form rather than after it. Set as a ruled definition list, not as cards —
 * these are clauses, and clauses do not need boxes.
 */
export function Assurances() {
  return (
    <section aria-labelledby="assurances-heading">
      <h2 className="tag" id="assurances-heading">
        Terms worth knowing
      </h2>
      <dl style={{ marginTop: "var(--space-4)" }}>
        {ASSURANCES.map((item) => (
          <div className="assurance" key={item.label}>
            <dt className="assurance-label">{item.label}</dt>
            <dd className="assurance-body">{item.body}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
