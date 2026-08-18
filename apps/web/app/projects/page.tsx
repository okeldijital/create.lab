import Link from "next/link";

export default function ProjectsPage() {
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
        <h1>Projects</h1>
        <article>
          <h2>Project workspace</h2>
          <p>
            Project data will appear after an authenticated organization
            context has been established at the application boundary.
          </p>
        </article>
      </section>
    </main>
  );
}
