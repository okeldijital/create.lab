import Link from "next/link";

export default function OrganizationPage() {
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
        <p>WORKSPACE</p>
        <h1>Organization</h1>
        <article>
          <h2>Organization context</h2>
          <p>
            No organization context is established in the current application
            shell. Identity, membership and tenant authorization will be
            resolved at the application boundary before organization data is
            displayed.
          </p>
        </article>
      </section>
    </main>
  );
}
