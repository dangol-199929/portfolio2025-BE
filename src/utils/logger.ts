export type LogLevel = "info" | "warn" | "error";

export interface Logger {
  info: (message: string, meta?: unknown) => void;
  warn: (message: string, meta?: unknown) => void;
  error: (message: string, meta?: unknown) => void;
}

function log(level: LogLevel, message: string, meta?: unknown): void {
  // Simple console-based logger; can be swapped for Pino in AWS.
  if (meta !== undefined) {
    // eslint-disable-next-line no-console
    console[level](`[${level.toUpperCase()}] ${message}`, meta);
  } else {
    // eslint-disable-next-line no-console
    console[level](`[${level.toUpperCase()}] ${message}`);
  }
}

export const logger: Logger = {
  info: (message, meta) => log("info", message, meta),
  warn: (message, meta) => log("warn", message, meta),
  error: (message, meta) => log("error", message, meta),
};
