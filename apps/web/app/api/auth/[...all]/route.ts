import { toNextJsHandler } from "better-auth/next-js";
import { getBetterAuth } from "../../../../lib/auth/better-auth";

export const runtime = "nodejs";

const handler = toNextJsHandler(getBetterAuth());

export const GET = handler.GET;
export const POST = handler.POST;
