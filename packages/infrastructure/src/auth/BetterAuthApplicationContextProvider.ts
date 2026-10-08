import type {
  ApplicationContext,
  ApplicationContextProvider,
  MembershipReader,
} from "@creative-lab/application";
import type { BetterAuthRuntimeSession } from "./CurrentIdentityService.js";
import { CurrentIdentityService } from "./CurrentIdentityService.js";

/**
 * Narrow server-side seam between Better Auth and the application runtime.
 *
 * The web layer supplies Better Auth's real `auth.api.getSession` function;
 * this infrastructure adapter owns the conversion and membership gate.
 */
export type BetterAuthSessionResolver = () => Promise<BetterAuthRuntimeSession | null | undefined>;

export function createBetterAuthApplicationContextProvider(
  resolveSession: BetterAuthSessionResolver,
  memberships: MembershipReader,
): ApplicationContextProvider {
  const identity = new CurrentIdentityService(memberships);

  return {
    async getContext(): Promise<ApplicationContext> {
      const context = await identity.resolveFromBetterAuthSession(await resolveSession());
      if (!context) {
        throw new Error("Authenticated organization and actor context is required.");
      }
      return context;
    },
  };
}
