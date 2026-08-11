import { randomUUID } from "node:crypto";

/** Generate a UUID v4 identity string (domain-local helper). */
export function generateId(): string {
  return randomUUID();
}
