import Link from "next/link";
import { getApplicationContext, MissingRequestContextError } from "../../lib/request-context";

export default async function OrganizationPage() {
  let tenantReady = false;
  try {
    await getApplicationContext();
    tenantReady = true;
  } catch (error) {
    if (!(error instanceof MissingRequestContextError)) throw error;
  }

  return (
    <main><aside><strong>Creative Lab</strong><nav><Link href="/">Overview</Link><Link href="/projects">Projects</Link><Link href="/organization">Organization</Link></nav></aside>
      <section><p>WORKSPACE</p><h1>Organization</h1><article><h2>Organization context</h2><p>{tenantReady ? "Authenticated organization context established. Organization queries are the next application integration step." : "An authenticated organization and actor context is required before organization data can be accessed."}</p></article></section>
    </main>
  );
}
