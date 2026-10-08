"use client";

import { useState } from "react";
import { Button, TextField } from "@creative-lab/ui";
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
      <TextField label="Name" name="name" required />
      <TextField label="Description" name="description" />
      {error ? <p className="cl-alert" role="alert">{error}</p> : null}
      <Button disabled={pending}>{pending ? "Creating…" : "Create project"}</Button>
    </form>
  );
}
