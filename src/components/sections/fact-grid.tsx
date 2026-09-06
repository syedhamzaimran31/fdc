import { PROJECT_FACTS } from "@/constants/project";

export function FactGrid() {
  return (
    <section aria-labelledby="facts-heading">
      <h2 className="tag" id="facts-heading">
        Specification
      </h2>

      <dl className="bg-border border-border mt-3 grid grid-cols-2 gap-px border">
        {PROJECT_FACTS.map((fact) => (
          <div className="bg-background flex flex-col p-4" key={fact.label}>
            {/* min-h reserves the label row so values share a baseline across the
                row even when one label wraps. */}
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
