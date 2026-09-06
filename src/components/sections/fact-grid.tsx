import { PROJECT_FACTS } from "@/constants/project";

/**
 * The four numbers a buyer checks before deciding whether to take the call.
 *
 * Each cell is a flex column with a reserved label row, so the values sit on a
 * shared baseline across the row even when one label wraps. Misaligned
 * baselines in a row of cells are the single thing that makes a grid look
 * broken.
 */
export function FactGrid() {
  return (
    <section aria-labelledby="facts-heading">
      <h2 className="tag" id="facts-heading">
        Specification
      </h2>

      {/* A 1px gap over a border-coloured background draws the grid rules
          without every cell needing its own border and a de-duplication rule. */}
      <dl className="bg-border border-border mt-3 grid grid-cols-2 gap-px border">
        {PROJECT_FACTS.map((fact) => (
          <div className="bg-background flex flex-col p-4" key={fact.label}>
            <dt className="tag min-h-8">{fact.label}</dt>
            <dd className="mt-auto">
              <p className="font-display text-[1.375rem] font-bold tracking-[-0.01em]">
                {fact.value}
              </p>
              <p className="text-muted-foreground font-data mt-1 text-xs">{fact.note}</p>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
