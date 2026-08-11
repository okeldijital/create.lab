import { randomUUID } from "node:crypto";

/**
 * Generate a new UUID v4 identity string.
 * Domain-local helper; no infrastructure coupling beyond Node crypto.
 */
export function generateId(): string {
  return randomUUID();
}
