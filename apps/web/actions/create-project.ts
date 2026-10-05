"use server";

import { isRedirectError, redirect } from "next/navigation";
import { createProject } from "../lib/application-runtime";
import { getApplicationContext } from "../lib/request-context";

export async function createProjectAction(formData: FormData): Promise<{ error?: string }> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!name) return { error: "Project name is required." };

  try {
    const context = await getApplicationContext();
    const project = await createProject(name, description || null, context);
    redirect(`/projects/${project.id}`);
  } catch (cause) {
    if (isRedirectError(cause)) throw cause;
    return { error: cause instanceof Error ? cause.message : "Could not create project." };
  }
}
