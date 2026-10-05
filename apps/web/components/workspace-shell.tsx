import Link from "next/link";
import type { ReactNode } from "react";
import { AppShell } from "@creative-lab/ui";
import { signOutAction } from "../actions/sign-out";
import { getOptionalSession } from "../lib/auth/session";

export async function WorkspaceShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  const session = await getOptionalSession();
  return (
    <AppShell
      brand="Creative Lab"
      eyebrow={eyebrow}
      title={title}
      nav={
        <>
          <Link href="/">Overview</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/organization">Organization</Link>
        </>
      }
      account={
        session ? (
          <form action={signOutAction}>
            <p>{session.name}</p>
            <button type="submit">Sign out</button>
          </form>
        ) : (
          <>
            <Link href="/login">Sign in</Link>
            <Link href="/signup">Create account</Link>
          </>
        )
      }
    >
      {children}
    </AppShell>
  );
}
