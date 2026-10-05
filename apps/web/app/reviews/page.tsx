import Link from "next/link";
import { WorkspaceShell } from "../../components/workspace-shell";
import { listProjects } from "../../lib/application-runtime";
import { getApplicationContext, MissingRequestContextError } from "../../lib/request-context";

export default async function ReviewsPage() {
  try {
    const context = await getApplicationContext();
    const projects = await listProjects(context);
    return <WorkspaceShell eyebrow="WORKSPACE" title="Reviews">
      <section className="cl-page-intro"><div><p className="cl-page-intro__eyebrow">REVIEWS</p><h2>Keep approvals moving.</h2><p>Reviews is the decision point between creative work and delivery. Review records will connect here as the Review context becomes active.</p></div></section>
      <section className="cl-reviews" aria-labelledby="reviews-heading">
        <div className="cl-section-heading"><div><p className="cl-section-heading__eyebrow">REVIEW QUEUE</p><h2 id="reviews-heading">Awaiting review</h2></div><span className="cl-status-note">{projects.length} projects</span></div>
        {projects.length===0 ? <div className="cl-empty-state"><strong>No reviews waiting.</strong><p>Projects will appear here when work is ready for internal or client review.</p></div> :
          <div className="cl-reviews-list">{projects.map(project=><Link key={project.id} href={`/projects/${project.id}`} className="cl-review-row"><span><strong>{project.name}</strong><small>{project.description ?? "No project description"}</small></span><span className="cl-status-badge">{project.status.replace(/_/g," ")}</span></Link>)}</div>}
      </section>
    </WorkspaceShell>;
  } catch(error) {
    if (!(error instanceof MissingRequestContextError)) throw error;
    return <WorkspaceShell eyebrow="WORKSPACE" title="Reviews"><article><h2>Sign in required</h2><p>Your session was not found. Sign in again to open this workspace.</p><Link href="/login">Sign in</Link></article></WorkspaceShell>;
  }
}
