import Link from "next/link";
import { WorkspaceShell } from "../../components/workspace-shell";
import { getApplicationContext, MissingRequestContextError } from "../../lib/request-context";

export default async function QuotesPage() {
  try {
    await getApplicationContext();
    return <WorkspaceShell eyebrow="BUSINESS" title="Quotes">
      <section className="cl-page-intro"><div><p className="cl-page-intro__eyebrow">QUOTES</p><h2>Turn services into clear proposals.</h2><p>Quotes will connect client requirements, selected services, pricing and approval before a project begins.</p></div></section>
      <section className="cl-quotes" aria-labelledby="quotes-heading">
        <div className="cl-section-heading"><div><p className="cl-section-heading__eyebrow">QUOTE PIPELINE</p><h2 id="quotes-heading">Your quotes</h2></div><span className="cl-status-note">Not configured</span></div>
        <div className="cl-empty-state"><strong>No quotes yet.</strong><p>Once the commercial model is connected, quotes will move from draft to sent, accepted or declined without leaving Creative Lab.</p><Link href="/services">Configure services first</Link></div>
      </section>
    </WorkspaceShell>;
  } catch (error) {
    if (!(error instanceof MissingRequestContextError)) throw error;
    return <WorkspaceShell eyebrow="BUSINESS" title="Quotes"><article><h2>Sign in required</h2><p>Your session was not found. Sign in again to open this workspace.</p><Link href="/login">Sign in</Link></article></WorkspaceShell>;
  }
}
