"use client";

import { useState } from "react";
import { createProjectAction } from "../actions/create-project";

export function CreateProjectForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    setError(null);
    setPending(true);
    try {
      const result = await createProjectAction(formData);
      if (result?.error) setError(result.error);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create project.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={submit}>
      <label>
        Name
        <input name="name" required minLength={2} maxLength={120} />
      </label>
      <label>
        Description
        <input name="description" maxLength={500} />
      </label>
      {error ? <p role="alert">{error}</p> : null}
      <button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create project"}
      </button>
    </form>
  );
}
