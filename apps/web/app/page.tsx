import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getBetterAuth } from "../lib/auth/better-auth";

export default async function HomePage() {
  const session = await getBetterAuth().api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/login");
  }

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
        <h1>Overview</h1>
        <article>
          <p>APPLICATION SHELL</p>
          <h2>Your creative operations, in one workspace.</h2>
          <p>The deployable foundation for organizations, projects and production workflows.</p>
          <Link href="/projects">View projects</Link>
        </article>
      </section>
    </main>
  );
}
