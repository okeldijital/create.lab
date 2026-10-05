"use client";

import { useState } from "react";
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
      <label>
        Name
        <input name="name" required minLength={2} maxLength={120} />
      </label>
      <label>
        Email
        <input name="email" type="email" required maxLength={200} />
      </label>
      <label>
        Phone
        <input name="phone" maxLength={40} />
      </label>
      {error ? <p role="alert">{error}</p> : null}
      <button type="submit" disabled={pending}>{pending ? "Adding…" : "Add client"}</button>
    </form>
  );
}
