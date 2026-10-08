import Link from "next/link";
import { WorkspaceShell } from "../../components/workspace-shell";
import { getApplicationContext, MissingRequestContextError } from "../../lib/request-context";

export default async function ServicesPage() {
  try {
    await getApplicationContext();
    return <WorkspaceShell eyebrow="BUSINESS" title="Services">
      <section className="cl-page-intro">
        <div><p className="cl-page-intro__eyebrow">SERVICES</p><h2>Define what the business delivers.</h2><p>Services will become the reusable commercial foundation for projects, quotations and client work.</p></div>
      </section>
      <section className="cl-services" aria-labelledby="services-heading">
        <div className="cl-section-heading"><div><p className="cl-section-heading__eyebrow">SERVICE CATALOG</p><h2 id="services-heading">Your services</h2></div><span className="cl-status-note">Not configured</span></div>
        <div className="cl-empty-state">
          <strong>No services configured yet.</strong>
          <p>Add the services this workspace offers. These will later connect directly to quotes and project creation.</p>
          <Link href="/organization">Open workspace settings</Link>
        </div>
      </section>
    </WorkspaceShell>;
  } catch (error) {
    if (!(error instanceof MissingRequestContextError)) throw error;
    return <WorkspaceShell eyebrow="BUSINESS" title="Services"><article><h2>Sign in required</h2><p>Your session was not found. Sign in again to open this workspace.</p><Link href="/login">Sign in</Link></article></WorkspaceShell>;
  }
}
