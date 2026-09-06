import { ASSURANCES } from "@/constants/project";

/**
 * The three objections that stop a Dubai off-plan enquiry, answered before the
 * form rather than after it. A ruled definition list, not cards — these are
 * clauses, and clauses do not need boxes.
 *
 * Label and body share a top baseline in every row, which is what keeps the
 * two columns reading as one document.
 */
export function Assurances() {
  return (
    <section aria-labelledby="assurances-heading">
      <h2 className="tag" id="assurances-heading">
        Terms worth knowing
      </h2>

      <dl className="mt-4">
        {ASSURANCES.map((item) => (
          <div
            className="border-border grid grid-cols-1 gap-2 border-t py-6 sm:grid-cols-[13rem_minmax(0,1fr)]
              sm:gap-8"
            key={item.label}
          >
            <dt className="font-display text-base font-bold tracking-[-0.01em]">{item.label}</dt>
            <dd className="text-muted-foreground max-w-[62ch] text-pretty">{item.body}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
