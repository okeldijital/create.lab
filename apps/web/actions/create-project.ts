"use server";

import { redirect } from "next/navigation";
import { createProject } from "../lib/application-runtime";
import { getApplicationContext } from "../lib/request-context";

function isNextRedirect(cause: unknown) {
  return (
    typeof cause === "object" &&
    cause !== null &&
    "digest" in cause &&
    String((cause as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT")
  );
}

export async function createProjectAction(formData: FormData): Promise<{ error?: string }> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!name) return { error: "Project name is required." };

  try {
    const context = await getApplicationContext();
    const project = await createProject(name, description || null, context);
    redirect(`/projects/${project.id}`);
  } catch (cause) {
    if (isNextRedirect(cause)) throw cause;
    return { error: cause instanceof Error ? cause.message : "Could not create project." };
  }
}
