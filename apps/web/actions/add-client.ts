"use server";

import { revalidatePath } from "next/cache";
import { addProjectClient } from "../lib/project-clients";
import { getApplicationContext } from "../lib/request-context";

export async function addClientAction(projectId: string, formData: FormData): Promise<{ error?: string }> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  if (name.length < 2) return { error: "Client name is required." };
  if (!email.includes("@")) return { error: "A contact email is required." };

  try {
    const context = await getApplicationContext();
    await addProjectClient({
      organizationId: context.organizationId,
      projectId,
      name,
      email,
      phone: phone || null,
    });
    revalidatePath(`/projects/${projectId}`);
    return {};
  } catch (cause) {
    return { error: cause instanceof Error ? cause.message : "Could not add client." };
  }
}
