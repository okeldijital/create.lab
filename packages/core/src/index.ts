/**
 * @creative-lab/core
 *
 * Domain Kernel — framework-agnostic DDD primitives for Creative Lab.
 * Authority: CORE-001 Shared Domain Kernel Consolidation.
 */

// Aggregates & entities
export { AggregateRoot } from "./aggregates/index.js";
export { Entity } from "./entities/index.js";

// Value objects
export { ValueObject } from "./value-objects/index.js";

// Events
export { DomainEvent, DOMAIN_EVENT_VERSION } from "./events/index.js";
export type { DomainEventProps, AnyDomainEvent } from "./events/index.js";

// Errors
export { DomainError } from "./errors/index.js";

// Identity
export { Identity } from "./identity/index.js";

// Specifications
export { Specification } from "./specifications/index.js";

// Clock
export type { Clock } from "./clock/index.js";
export { SystemClock, TestClock } from "./clock/index.js";

// Guards
export { Guard } from "./guards/index.js";

// Results
export { Result, Success, Failure } from "./results/index.js";

// Utils
export { generateId, deepEqual } from "./utils/index.js";
