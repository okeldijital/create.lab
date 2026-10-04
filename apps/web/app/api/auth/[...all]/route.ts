import { toNextJsHandler } from "better-auth/next-js";
import { getBetterAuth } from "../../../../lib/auth/better-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function handler() {
  return toNextJsHandler(getBetterAuth());
}

export function GET(request: Request) {
  return handler().GET(request);
}

export function POST(request: Request) {
  return handler().POST(request);
}
