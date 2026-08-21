import type { ApplicationContext } from "./context.js";

/**
 * Provider-agnostic boundary for resolving the authenticated application
 * context. Identity providers are adapters; application code consumes only
 * this contract.
 */
export interface ApplicationContextProvider {
  getContext(): Promise<ApplicationContext>;
}
