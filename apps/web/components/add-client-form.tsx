"use client";

import { useState } from "react";
import { Button, TextField } from "@creative-lab/ui";
import { addClientAction } from "../actions/add-client";

export function AddClientForm({ projectId }: { projectId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    setError(null);
    setPending(true);
    const result = await addClientAction(projectId, formData);
    setError(result.error ?? null);
    setPending(false);
    if (!result.error) (document.getElementById("add-client") as HTMLFormElement | null)?.reset();
  }

  return (
    <form id="add-client" action={submit}>
      <TextField label="Name" name="name" required />
      <TextField label="Email" name="email" type="email" required />
      <TextField label="Phone" name="phone" />
      {error ? <p className="cl-alert" role="alert">{error}</p> : null}
      <Button disabled={pending}>{pending ? "Adding…" : "Add client"}</Button>
    </form>
  );
}
