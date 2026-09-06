import { LeadForm } from "@/components/leads/lead-form";
import { Assurances } from "@/components/sections/assurances";
import { FactGrid } from "@/components/sections/fact-grid";
import { PaymentRail } from "@/components/sections/payment-rail";
import { Thesis } from "@/components/sections/thesis";
import { PROJECT } from "@/constants/project";

/**
 * Server component. Only the enquiry form is interactive, so it is the only
 * thing that ships JavaScript.
 *
 * Layout: one shell width, one gutter token, used by the masthead, the grid and
 * the colophon alike, so the three bands can never drift out of alignment.
 *
 * The column split is 1fr / clamp(26rem, 32vw, 31rem). The form is the page's
 * entire purpose, so it gets a fixed comfortable measure and the prose column
 * absorbs the remaining width — not the other way round.
 */
export default function HomePage() {
  return (
    <>
      <a
        className="bg-foreground text-background font-data focus:top-4 absolute -top-24 left-4 z-50
          px-4 py-3 text-sm no-underline transition-[top] duration-200"
        href="#enquiry"
      >
        Skip to the enquiry form
      </a>

      <header className="border-border-strong border-b">
        <div
          className="mx-auto flex max-w-shell flex-wrap items-baseline justify-between gap-x-6
            gap-y-1 px-5 py-4 sm:px-8"
        >
          <p className="font-display text-[0.9375rem] font-bold tracking-[0.16em] uppercase">
            {PROJECT.name}
          </p>
          <div className="flex gap-x-6">
            <p className="tag">Ref {PROJECT.reference}</p>
            <p className="tag">{PROJECT.handover.value} handover</p>
          </div>
        </div>
      </header>

      <main
        className="mx-auto grid max-w-shell grid-cols-1 gap-x-16 gap-y-14 px-5 pt-10 pb-20 sm:px-8
          lg:grid-cols-[minmax(0,1fr)_clamp(28rem,34vw,34rem)] lg:gap-y-24 lg:pt-14 lg:pb-32"
      >
        {/* space-y keeps one vertical rhythm between sections instead of each
            section inventing its own top margin. */}
        <div className="space-y-14 lg:space-y-20">
          <Thesis />
          <PaymentRail />
          <FactGrid />
          <Assurances />
        </div>

        {/* order-first on mobile: the form is why the page exists, and a phone
            user should not scroll past the whole prospectus to reach it. */}
        <div className="row-start-1 lg:sticky lg:top-8 lg:-mt-9 lg:self-start lg:row-start-auto">
          <section
            className="bg-surface border-foreground -mx-5 border-y px-5 py-8 sm:-mx-8 sm:px-8
              lg:mx-0 lg:border lg:px-8 lg:py-9"
            id="enquiry"
            aria-labelledby="enquiry-heading"
          >
            <p className="tag">Register interest</p>
            <h2
              className="font-display mt-3 text-[1.6rem] leading-tight font-bold tracking-[-0.02em]"
              id="enquiry-heading"
            >
              Get the price list and floor plates.
            </h2>
            <p className="text-muted-foreground border-border mt-3 border-b pb-6 text-base">
              Four fields. An advisor calls you back within one business day with the current
              availability for your band.
            </p>

            <LeadForm />

            <p className="text-muted-foreground font-data mt-5 text-xs leading-relaxed">
              We use your details to call you about {PROJECT.name} and nothing else. No list, no
              resale, no drip campaign.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-border-strong border-t">
        <div
          className="text-muted-foreground font-data mx-auto flex max-w-shell flex-col gap-6 px-5
            py-8 text-xs leading-relaxed sm:px-8 md:flex-row md:gap-16"
        >
          <p className="flex-none">
            {PROJECT.name}
            <br />
            {PROJECT.developer}
            <br />
            Ref {PROJECT.reference}
          </p>
          <p className="max-w-[60ch]">
            Prices, unit availability and the payment schedule are indicative and subject to the
            developer&rsquo;s current price list at the time of booking. Figures on this page are
            illustrative for the purposes of this build.
          </p>
        </div>
      </footer>
    </>
  );
}
