/**
 * Shared primitive types for the domain kernel.
 * Reserved for future non-domain-specific type aliases.
 */

/** Marker type for JSON-serializable domain payloads. */
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { readonly [key: string]: JsonValue };
