"use server";

import { redirect } from "next/navigation";
import { createProject } from "../lib/application-runtime";
import { getApplicationContext } from "../lib/request-context";

export async function createProjectAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!name) {
    throw new Error("Project name is required.");
  }

  const context = await getApplicationContext();
  const project = await createProject(name, description || null, context);
  redirect(`/projects/${project.id}`);
}
