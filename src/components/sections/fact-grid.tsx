import { PROJECT_FACTS } from "@/constants/project";

/** The four numbers a buyer checks before deciding whether to take the call. */
export function FactGrid() {
  return (
    <section aria-labelledby="facts-heading">
      <h2 className="tag" id="facts-heading">
        Specification
      </h2>
      <dl className="facts" style={{ marginTop: "var(--space-4)" }}>
        {PROJECT_FACTS.map((fact) => (
          <div className="fact" key={fact.label}>
            <dt className="tag">{fact.label}</dt>
            <dd>
              <p className="fact-value">{fact.value}</p>
              <p className="fact-note">{fact.note}</p>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
