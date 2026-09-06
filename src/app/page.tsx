import { LeadForm } from "@/components/leads/lead-form";
import { Assurances } from "@/components/sections/assurances";
import { FactGrid } from "@/components/sections/fact-grid";
import { PaymentRail } from "@/components/sections/payment-rail";
import { Thesis } from "@/components/sections/thesis";
import { PROJECT } from "@/constants/project";
import { isDatabaseConfigured } from "@/lib/env";

/**
 * The two-column split starts at xl, not lg: between 1024 and 1280 both
 * columns are too narrow — the headline wraps to four lines and the rail
 * labels break — so mid-size gets the stacked layout with the form first.
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
        className="mx-auto grid max-w-shell grid-cols-1 gap-x-16 gap-y-10 px-5 pt-8 pb-16 sm:px-8
          xl:grid-cols-[minmax(0,1fr)_clamp(28rem,34vw,34rem)] lg:gap-y-12 lg:pt-12 lg:pb-20"
      >
        <div className="space-y-10 xl:space-y-12">
          <Thesis />
          <PaymentRail />
          <FactGrid />
          <Assurances />
        </div>

        {/*
          Capped to the viewport with its own scroll container, so a form taller
          than the screen stays reachable instead of stranding the submit button.
          overscroll-contain stops that inner scroll chaining into the page.
        */}
        <div
          className="panel-scroll row-start-1 xl:row-start-auto xl:sticky xl:top-8 xl:-mt-9
            xl:self-start xl:max-h-[calc(100dvh-4rem)] xl:overflow-y-auto xl:overscroll-contain
            xl:border xl:border-foreground xl:bg-surface"
        >
          <section
            className="bg-surface border-foreground -mx-5 border-y px-5 py-7
              sm:mx-auto sm:w-full sm:max-w-[36rem] sm:border sm:px-8
              xl:mx-0 xl:max-w-none xl:border-0 xl:bg-transparent xl:pr-6"
            id="enquiry"
            aria-labelledby="enquiry-heading"
          >
            <p className="tag">Register interest</p>
            <h2
              className="font-display mt-2 text-[1.6rem] leading-tight font-bold tracking-[-0.02em]"
              id="enquiry-heading"
            >
              Get the price list and floor plates.
            </h2>
            <p className="text-muted-foreground border-border mt-2 border-b pb-5 text-base">
              All four fields are required. An advisor calls you back within one business day
              with the current availability for your band.
            </p>

            {/* Evaluated at build time. Without a database the endpoint still answers,
                but nothing is durably stored, so the page has to say so rather than
                show a confirmation that means nothing. */}
            {!isDatabaseConfigured ? (
              <p
                className="border-destructive bg-destructive-surface text-destructive font-data mt-5
                  border-l-4 px-4 py-3 text-xs leading-relaxed"
                role="status"
              >
                Demo mode: DATABASE_URL is not set, so enquiries are held in memory and are not
                saved. Set it in .env to store leads properly.
              </p>
            ) : null}

            <LeadForm />

            
          </section>
        </div>
      </main>

      <footer className="border-border-strong border-t">
        <div
          className="text-muted-foreground font-data mx-auto flex max-w-shell flex-col gap-5 px-5
            py-7 text-xs leading-relaxed sm:px-8 md:flex-row md:gap-16"
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
