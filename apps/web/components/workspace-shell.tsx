import type { ReactNode } from "react";
import { AppShell } from "@creative-lab/ui";
import { signOutAction } from "../actions/sign-out";
import { getOptionalSession } from "../lib/auth/session";
import { WorkspaceNav } from "./workspace-nav";

export async function WorkspaceShell({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  const session = await getOptionalSession();
  return <AppShell brand="create.lab" workspace="Workspace" eyebrow={eyebrow} title={title}
    nav={<WorkspaceNav />}
    account={session ? <form action={signOutAction}><p>{session.name}</p><button type="submit">Sign out</button></form> : <><a href="/login">Sign in</a><a href="/signup">Create account</a></>}
  >{children}</AppShell>;
}
