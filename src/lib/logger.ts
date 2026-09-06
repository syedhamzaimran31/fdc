type LogLevel = "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

/** Never log a full lead — contact details are personal data. Log ids. */
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
