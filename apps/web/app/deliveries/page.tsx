import Link from "next/link";
import { WorkspaceShell } from "../../components/workspace-shell";
import { listProjects } from "../../lib/application-runtime";
import { getApplicationContext, MissingRequestContextError } from "../../lib/request-context";

export default async function DeliveriesPage() {
  try {
    const context = await getApplicationContext();
    const deliveryProjects = (await listProjects(context)).filter((project) => {
      const status = project.status.toLowerCase();
      return status === "approved" || status === "balance";
    });
    return <WorkspaceShell eyebrow="WORKSPACE" title="Deliveries">
      <section className="cl-page-intro">
        <div>
          <p className="cl-page-intro__eyebrow">DELIVERIES</p>
          <h2>Finish the work cleanly.</h2>
          <p>Deliveries is the final operational handoff. Delivery records will connect here as the Delivery context becomes active.</p>
        </div>
      </section>
      <section className="cl-deliveries" aria-labelledby="deliveries-heading">
        <div className="cl-section-heading">
          <div><p className="cl-section-heading__eyebrow">DELIVERY QUEUE</p><h2 id="deliveries-heading">Ready for delivery</h2></div>
          <span className="cl-status-note">{deliveryProjects.length} projects</span>
        </div>
        {deliveryProjects.length === 0 ? <div className="cl-empty-state"><strong>No deliveries waiting.</strong><p>Projects will appear here when work is approved and ready to hand off.</p></div> :
          <div className="cl-deliveries-list">{deliveryProjects.map(project => <Link key={project.id} href={`/projects/${project.id}`} className="cl-delivery-row"><span><strong>{project.name}</strong><small>{project.description ?? "No project description"}</small></span><span className="cl-status-badge">{project.status.replace(/_/g, " ")}</span></Link>)}</div>}
      </section>
    </WorkspaceShell>;
  } catch (error) {
    if (!(error instanceof MissingRequestContextError)) throw error;
    return <WorkspaceShell eyebrow="WORKSPACE" title="Deliveries"><article><h2>Sign in required</h2><p>Your session was not found. Sign in again to open this workspace.</p><Link href="/login">Sign in</Link></article></WorkspaceShell>;
  }
}
