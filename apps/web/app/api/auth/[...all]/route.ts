import { toNextJsHandler } from "better-auth/next-js";
import {
  ensureBetterAuthSchema,
  getBetterAuth,
  repairIncompleteSignup,
} from "../../../../lib/auth/better-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handler(request: Request) {
  await ensureBetterAuthSchema();
  if (request.method === "POST" && new URL(request.url).pathname.endsWith("/sign-up/email")) {
    const body = await request.clone().json().catch(() => null) as { email?: string } | null;
    if (body?.email) await repairIncompleteSignup(body.email);
  }
  const authHandler = toNextJsHandler(getBetterAuth());
  return request.method === "POST" ? authHandler.POST(request) : authHandler.GET(request);
}

export function GET(request: Request) {
  return handler(request);
}

export function POST(request: Request) {
  return handler(request);
}
