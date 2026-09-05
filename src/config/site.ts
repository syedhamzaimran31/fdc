/**
 * Single source of truth for copy and SEO metadata that a non-technical
 * teammate is likely to want to change. Keeping it here means the page
 * components stay presentational.
 */
export const siteConfig = {
  name: "Skyline Residences",
  title: "Skyline Residences | Off-Plan Apartments in Dubai",
  description:
    "Off-plan 1 and 2 bedroom apartments in Dubai. Flexible payment plans, handover 2027. Register your interest and our team will be in touch.",
  /**
   * Used for canonical + Open Graph URLs. Set NEXT_PUBLIC_SITE_URL in the
   * hosting environment; the localhost fallback only applies in development.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en_AE",
} as const;
