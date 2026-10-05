import Link from "next/link";
import type { ReactNode } from "react";
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
    <main>
      <aside>
        <strong>Creative Lab</strong>
        <nav>
          <Link href="/">Overview</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/organization">Organization</Link>
          {session ? (
            <form action={signOutAction}>
              <p>{session.name}</p>
              <button type="submit">Sign out</button>
            </form>
          ) : (
            <>
              <Link href="/login">Sign in</Link>
              <Link href="/signup">Create account</Link>
            </>
          )}
        </nav>
      </aside>
      <section>
        <p>{eyebrow}</p>
        <h1>{title}</h1>
        {children}
      </section>
    </main>
  );
}
