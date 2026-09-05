import { LeadForm } from "@/components/leads/lead-form";
import { Assurances } from "@/components/sections/assurances";
import { FactGrid } from "@/components/sections/fact-grid";
import { PaymentRail } from "@/components/sections/payment-rail";
import { Thesis } from "@/components/sections/thesis";
import { PROJECT } from "@/constants/project";

/**
 * Server component. Only the enquiry form is interactive, so it is the only
 * thing that ships JavaScript to the browser.
 */
export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#enquiry">
        Skip to the enquiry form
      </a>

      <header className="masthead">
        <div className="shell masthead-inner">
          <p className="masthead-name">{PROJECT.name}</p>
          <div className="masthead-meta">
            <p className="tag">Ref {PROJECT.reference}</p>
            <p className="tag">{PROJECT.handover.value} handover</p>
          </div>
        </div>
      </header>

      <main className="shell layout">
        <div className="prospectus">
          <Thesis />
          <PaymentRail />
          <FactGrid />
          <Assurances />
        </div>

        <div className="sheet-column">
          <section className="sheet" id="enquiry" aria-labelledby="enquiry-heading">
            <p className="tag">Register interest</p>
            <h2 className="sheet-title" id="enquiry-heading">
              Get the price list and floor plates.
            </h2>
            <p className="sheet-lede">
              Four fields. An advisor calls you back within one business day with the current
              availability for your band.
            </p>

            <LeadForm />

            <p className="sheet-foot">
              We use your details to call you about {PROJECT.name} and nothing else. No list, no
              resale, no drip campaign.
            </p>
          </section>
        </div>
      </main>

      <footer className="colophon">
        <div className="shell colophon-inner">
          <p>
            {PROJECT.name}
            <br />
            {PROJECT.developer}
            <br />
            Ref {PROJECT.reference}
          </p>
          <p className="colophon-note">
            Prices, unit availability and the payment schedule are indicative and subject to the
            developer&rsquo;s current price list at the time of booking. Figures on this page are
            illustrative for the purposes of this build.
          </p>
        </div>
      </footer>
    </>
  );
}
