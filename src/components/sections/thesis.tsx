import { PROJECT } from "@/constants/project";

export function Thesis() {
  return (
    <section aria-labelledby="thesis-heading">
      <p className="tag">
        {PROJECT.district} · {PROJECT.developer}
      </p>

      <h1
        className="font-display mt-3 text-[clamp(2.375rem,6.2vw,4.25rem)] leading-[0.98] font-bold
          tracking-[-0.03em] text-balance"
        id="thesis-heading"
      >
        Off plan is a payment schedule, <span className="text-primary">not a price.</span>
      </h1>

      <p className="text-muted-foreground mt-5 max-w-[68ch] text-[1.1875rem] text-pretty">
        {PROJECT.name} is 1 and 2 bedroom apartments handing over in {PROJECT.handover.value}. You
        pay a fifth to reserve and the rest against construction milestones. Below is the whole
        schedule, the current price list position, and a form that takes about twenty seconds.
      </p>
    </section>
  );
}
