/**
 * Dilim H — structured JSON logging (no APM vendor).
 * Emits one JSON line to stdout/stderr for Attempt / Gate / API errors.
 */

export type LogLevel = "info" | "warn" | "error";

export type LogFields = Record<string, string | number | boolean | null | undefined>;

function emit(level: LogLevel, event: string, fields: LogFields = {}) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    service: "soundteacher",
    event,
    ...fields,
  });
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.info(line);
  }
}

export const log = {
  info: (event: string, fields?: LogFields) => emit("info", event, fields),
  warn: (event: string, fields?: LogFields) => emit("warn", event, fields),
  error: (event: string, fields?: LogFields) => emit("error", event, fields),
};
