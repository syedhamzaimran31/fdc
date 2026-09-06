import { ASSURANCES } from "@/constants/project";

export function Assurances() {
  return (
    <section aria-labelledby="assurances-heading">
      <h2 className="tag" id="assurances-heading">
        Terms worth knowing
      </h2>

      <dl className="mt-3">
        {ASSURANCES.map((item) => (
          <div
            className="border-border grid grid-cols-1 gap-2 border-t py-5 sm:grid-cols-[13rem_minmax(0,1fr)]
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
