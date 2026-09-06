/**
 * A database is configured when DATABASE_URL is present. Everything that has to
 * behave differently without one reads this, so there is a single answer rather
 * than four scattered truthiness checks.
 */
export const isDatabaseConfigured = Boolean(process.env.DATABASE_URL);
