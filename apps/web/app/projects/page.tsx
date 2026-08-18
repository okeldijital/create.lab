import Link from "next/link";
import { getApplicationContext, MissingRequestContextError } from "../../lib/request-context";

export default async function ProjectsPage() {
  let tenantReady = false;
  try {
    await getApplicationContext();
    tenantReady = true;
  } catch (error) {
    if (!(error instanceof MissingRequestContextError)) throw error;
  }

  return (
    <main><aside><strong>Creative Lab</strong><nav><Link href="/">Overview</Link><Link href="/projects">Projects</Link><Link href="/organization">Organization</Link></nav></aside>
      <section><p>WORKSPACE</p><h1>Projects</h1><article><h2>Project workspace</h2><p>{tenantReady ? "Authenticated organization context established. Project queries are the next application integration step." : "An authenticated organization context is required before project data can be accessed."}</p></article></section>
    </main>
  );
}
