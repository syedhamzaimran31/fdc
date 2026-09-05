type LogLevel = "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

/**
 * Thin structured-logging wrapper. It exists so that swapping console for a
 * real sink (Axiom, Datadog, Sentry) is one file, and so that log lines are
 * greppable JSON rather than free-form strings.
 *
 * Never log a full lead: names, emails and phone numbers are personal data and
 * do not belong in a log aggregator. Log the id and the outcome.
 */
function write(level: LogLevel, scope: string, message: string, context?: LogContext): void {
  const entry = {
    level,
    scope,
    message,
    ...context,
    at: new Date().toISOString(),
  };

  const line = JSON.stringify(entry);

  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

export const logger = {
  info: (scope: string, message: string, context?: LogContext) =>
    write("info", scope, message, context),
  warn: (scope: string, message: string, context?: LogContext) =>
    write("warn", scope, message, context),
  error: (scope: string, message: string, context?: LogContext) =>
    write("error", scope, message, context),
};
