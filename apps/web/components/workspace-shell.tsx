import Link from "next/link";
import type { ReactNode } from "react";

export function WorkspaceShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <main>
      <aside>
        <strong>Creative Lab</strong>
        <nav>
          <Link href="/">Overview</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/organization">Organization</Link>
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
