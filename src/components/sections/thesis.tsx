import { PROJECT } from "@/constants/project";

/**
 * The hero states the page's actual claim rather than shouting the project
 * name. A buyer comparing four brokerages the same afternoon is deciding on
 * terms, so the terms open the page.
 */
export function Thesis() {
  return (
    <section aria-labelledby="thesis-heading">
      <p className="tag">
        {PROJECT.district} · {PROJECT.developer}
      </p>
      <h1 className="thesis-heading" id="thesis-heading">
        Off plan is a payment schedule, <em>not a price.</em>
      </h1>
      <p className="thesis-body">
        {PROJECT.name} is 1 and 2 bedroom apartments handing over in {PROJECT.handover.value}. You
        pay a fifth to reserve and the rest against construction milestones. Below is the whole
        schedule, the current price list position, and a form that takes about twenty seconds.
      </p>
    </section>
  );
}
