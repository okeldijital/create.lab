"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getBetterAuth } from "../lib/auth/better-auth";

export async function signOutAction() {
  await getBetterAuth().api.signOut({ headers: await headers() });
  redirect("/login");
}
