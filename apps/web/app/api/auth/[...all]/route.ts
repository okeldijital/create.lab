import { toNextJsHandler } from "better-auth/next-js";
import { ensureBetterAuthSchema, getBetterAuth } from "../../../../lib/auth/better-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handler(request: Request) {
  await ensureBetterAuthSchema();
  const authHandler = toNextJsHandler(getBetterAuth());
  return request.method === "POST" ? authHandler.POST(request) : authHandler.GET(request);
}

export function GET(request: Request) {
  return handler(request);
}

export function POST(request: Request) {
  return handler(request);
}
